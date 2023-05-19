use std::{
    convert::Infallible, net::SocketAddr, num::NonZeroUsize, ops::DerefMut, sync::Arc,
    time::Duration,
};

use diesel::prelude::*;
use fuzzy_matcher::{skim::SkimMatcherV2, FuzzyMatcher};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use warp::{hyper::StatusCode, reply::Response, Filter, Reply};

type Db = Arc<Mutex<SqliteConnection>>;

#[derive(Deserialize)]
struct RecipesQuery {
    query: String,
    limit: Option<NonZeroUsize>,
    offset: Option<NonZeroUsize>,
}

#[derive(Deserialize)]
struct CreateRecipeBody {
    title: String,
    description: String,
    rating: i32,
    time: i32,
    cost: f32,
    ingredients: Vec<String>,
    image_blob: Option<String>,
}

#[derive(Serialize)]
struct RecipeWithIngredients {
    id: String,
    title: String,
    description: String,
    rating: i32,
    time: i32,
    cost: f32,
    ingredients: Vec<String>,
}

async fn handle_create_recipe(body: CreateRecipeBody, conn: Db) -> Result<impl Reply, Infallible> {
    let mut conn = conn.lock().await;
    use crate::model::{NewIngredient, Recipe};
    use crate::schema::{ingredients, recipes};
    let recipe = Recipe::new(
        &body.title,
        &body.description,
        body.rating as u8,
        Duration::from_secs(body.time as u64 * 60),
        body.cost,
    );
    let ingredients: Vec<NewIngredient> = body
        .ingredients
        .into_iter()
        .map(|title| NewIngredient {
            recipe_id: recipe.id.clone(),
            title,
        })
        .collect();
    diesel::insert_into(recipes::table)
        .values(&recipe)
        .execute(conn.deref_mut())
        .expect("Failed to insert recipe into DB");
    diesel::insert_into(ingredients::table)
        .values(&ingredients)
        .execute(conn.deref_mut())
        .expect("Failed to insert ingredients into DB");
    // TODO: handle image blob
    Ok(warp::reply::json(&recipe.id))
}

async fn handle_get_recipe_by_id(uid: String, conn: Db) -> Result<Response, Infallible> {
    use crate::model::{Ingredient, Recipe};
    use crate::schema::ingredients::dsl::*;
    use crate::schema::{ingredients, recipes};

    let mut conn = conn.lock().await;
    let mut found_recipe = recipes::table
        .find(uid)
        .load::<Recipe>(conn.deref_mut())
        .expect("Failed to load Recipe with UID from DB");
    assert!(found_recipe.len() <= 1);
    if found_recipe.is_empty() {
        return Ok(StatusCode::NOT_FOUND.into_response());
    }
    let found_recipe: Recipe = found_recipe.remove(0);
    let ingredients_list = ingredients::table
        .filter(recipe_id.eq(&found_recipe.id))
        .load::<Ingredient>(conn.deref_mut())
        .expect("Failed to load ingredients for recipe from DB");
    let ingredients_list: Vec<String> = ingredients_list.into_iter().map(|ing| ing.title).collect();

    let response_recipe = RecipeWithIngredients {
        id: found_recipe.id,
        title: found_recipe.title,
        description: found_recipe.description,
        rating: found_recipe.rating,
        time: found_recipe.time,
        cost: found_recipe.cost,
        ingredients: ingredients_list,
    };

    Ok(warp::reply::json(&response_recipe).into_response())
}

fn fuzzy_sort_recipes(
    recipes: Vec<RecipeWithIngredients>,
    query: &str,
) -> Vec<RecipeWithIngredients> {
    let matcher = SkimMatcherV2::default();
    let mut results: Vec<(RecipeWithIngredients, i64)> = recipes
        .into_iter()
        .map(|rec| {
            (
                format!(
                    "{} {} {}",
                    &rec.title,
                    &rec.description,
                    &rec.ingredients.join(", ")
                ),
                rec,
            )
        })
        .map(|(s, rec)| (rec, matcher.fuzzy_match(&s, query)))
        .filter(|(_, res)| res.is_some())
        .map(|(rec, opt)| (rec, opt.unwrap()))
        .collect();
    results.sort_by_key(|(_, score)| *score);
    results.into_iter().map(|(rec, _)| rec).collect()
}

async fn handle_get_recipes_filtered(
    query: RecipesQuery,
    conn: Db,
) -> Result<impl Reply, Infallible> {
    let recipe_list: Vec<RecipeWithIngredients> = {
        use crate::model::{Ingredient, Recipe};
        use crate::schema::recipes::dsl::*;
        let mut conn = conn.lock().await;
        let recipes_list = recipes
            .load::<Recipe>(conn.deref_mut())
            .expect("Reading recipes from DB failed");

        let recipe_ingredients = Ingredient::belonging_to(&recipes_list)
            .load::<Ingredient>(conn.deref_mut())
            .expect("Reading ingredients from DB failed")
            .grouped_by(&recipes_list);

        recipe_ingredients
            .into_iter()
            .zip(recipes_list)
            .map(|(ingreds, rec)| RecipeWithIngredients {
                id: rec.id,
                title: rec.title,
                description: rec.description,
                rating: rec.rating,
                time: rec.time,
                cost: rec.cost,
                ingredients: ingreds.into_iter().map(|ingred| ingred.title).collect(),
            })
            .collect()
    };
    let mut sorted = fuzzy_sort_recipes(recipe_list, &query.query);
    if let Some(offset) = query.offset {
        let offset: usize = offset.into();
        if offset < sorted.len() {
            sorted.drain(0..offset);
        }
    }
    if let Some(limit) = query.limit {
        sorted.truncate(limit.into())
    }

    Ok(warp::reply::json(&sorted))
}

fn with_db(db: Db) -> impl Filter<Extract = (Db,), Error = std::convert::Infallible> + Clone {
    warp::any().map(move || db.clone())
}

pub async fn run_server(addr: SocketAddr, conn: Db) {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["POST", "GET"]);

    let create_recipe = warp::post()
        .and(warp::path("recipe"))
        .and(warp::body::json())
        .and(with_db(conn.clone()))
        .and_then(handle_create_recipe);

    let recipe_by_id = warp::get()
        .and(warp::path("recipe"))
        .and(warp::path::param::<String>())
        .and(with_db(conn.clone()))
        .and_then(handle_get_recipe_by_id);

    let recipes_filtered = warp::get()
        .and(warp::path("recipes"))
        .and(warp::query::<RecipesQuery>())
        .and(with_db(conn.clone()))
        .and_then(handle_get_recipes_filtered);

    let filter = recipe_by_id
        .or(recipes_filtered)
        .or(create_recipe)
        .with(cors);

    let (addr, server) = warp::serve(filter).bind_with_graceful_shutdown(addr, shutdown_signal());
    println!("Serving on address {} with port {}", addr.ip(), addr.port());
    server.await;
    println!("Server closed");
}

async fn shutdown_signal() {
    tokio::signal::ctrl_c()
        .await
        .expect("Failed installing Ctrl+C handler");
}
