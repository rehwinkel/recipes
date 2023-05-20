// @generated automatically by Diesel CLI.

diesel::table! {
    ingredients (id) {
        id -> Integer,
        title -> Text,
        recipe_id -> Text,
    }
}

diesel::table! {
    recipes (id) {
        id -> Text,
        title -> Text,
        descText -> Text,
        rating -> Integer,
        requiredTime -> Integer,
        cost -> Float,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    ingredients,
    recipes,
);
