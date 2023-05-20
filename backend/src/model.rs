use std::time::Duration;

use super::schema::ingredients;
use super::schema::recipes;
use base64::Engine;
use rand::RngCore;

use diesel::prelude::*;

#[derive(Queryable, Insertable, Identifiable, Debug)]
pub struct Recipe {
    pub id: String,
    pub title: String,
    #[diesel(column_name = descText)]
    pub description: String,
    pub rating: i32,
    #[diesel(column_name = requiredTime)]
    pub time: i32,
    pub cost: f32,
}

#[derive(Associations, Queryable, Identifiable, Debug)]
#[diesel(belongs_to(Recipe))]
pub struct Ingredient {
    pub id: i32,
    pub title: String,
    pub recipe_id: String,
}

#[derive(Insertable)]
#[diesel(table_name = ingredients)]
pub struct NewIngredient {
    pub recipe_id: String,
    pub title: String,
}

fn generate_uid() -> String {
    let engine = &base64::engine::general_purpose::URL_SAFE_NO_PAD;
    let mut data = [0; 8]; // 64 bits of ID
    let mut rng = rand::thread_rng();
    rng.fill_bytes(&mut data);
    let mut output = [0; 11];
    engine.encode_slice(&data, &mut output).unwrap();
    std::str::from_utf8(&output).unwrap().to_string()
}

impl Recipe {
    pub fn new(title: &str, description: &str, rating: u8, time: Duration, cost: f32) -> Self {
        Recipe {
            id: generate_uid(),
            title: title.to_string(),
            description: description.to_string(),
            rating: rating as i32,
            time: (time.as_secs() / 60) as i32,
            cost: cost,
        }
    }
}
