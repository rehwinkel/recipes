import { A, useNavigate } from "@solidjs/router";
import { Component, createResource, createSignal, For } from "solid-js";
import Loading from "./Loading";
import search_icon from "./assets/icons/magnify.svg";
import { Recipe } from "./Recipe";
import Stars from "./Stars";
import styles from "./FoodList.module.css";
import missing_food from "./assets/icons/file-remove-outline.svg";
import { API_BASE_URL, IMAGES_BASE_URL } from "./constants";


const fetchRecipes = async (query: string) => {
    let data = await fetch(API_BASE_URL + "/recipes?query=" + query);
    let body = await data.json() as Array<Recipe>;
    return body;
}

const RecipeCard: Component<{ recipe: Recipe }> = (props) => {
    const navigate = useNavigate();

    return (
        <div class={styles.foodcard + " max-w-lg md:w-1/2 xl:w-1/3 2xl:w-1/4"}>
            <div onClick={() => navigate("/recipe/" + props.recipe.id)} class="rounded-2xl shadow-xl m-2 bg-slate-100 hover:shadow-2xl transition-all hover:bg-slate-200 active:bg-slate-300">
                {props.recipe.image
                    ?
                    <img src={IMAGES_BASE_URL + "/" + props.recipe.image} class="w-full h-auto rounded-t-xl object-cover aspect-video" />
                    :
                    <img src={missing_food} class="aspect-video" />
                }
                <div class="p-6 flex flex-row items-center">
                    <span class="text-xl font-semibold">
                        {props.recipe.title}
                    </span>
                    <div class="flex-grow" />
                    <Stars stars={props.recipe.rating} />
                </div>
            </div>
        </div>
    );
};

const FoodList: Component = () => {
    const [searching, setSearching] = createSignal(false);
    const [query, setQuery] = createSignal("");
    const [recipes] = createResource(query, fetchRecipes);

    let searchBar: HTMLInputElement | undefined;

    const startSearch = () => {
        setSearching(true);
        searchBar?.focus();
    };

    const endSearch = () => {
        if (query() == "") {
            setSearching(false);
        }
    };

    return (
        <div class="sm:p-20 p-8">
            <div class="flex flex-row items-center mb-8">
                {
                    searching() ?
                        <input ref={searchBar} class="text-4xl block border-none outline-none" onBlur={endSearch} onInput={(elem) => setQuery(elem.target.value)} />
                        :
                        <h1 class="text-4xl flex flex-row" onClick={startSearch}>
                            Recipes
                            <img src={search_icon} class="ml-4 h-10"></img>
                        </h1>
                }
                <div class="flex-grow"></div>
                <A href="/create" class="bg-lime-400 hover:bg-lime-600 active:bg-lime-300 rounded-xl p-3 font-bold text-black transition-all">Add Recipe</A>
            </div>
            <div class="-m-2 flex flex-wrap">
                {recipes() === undefined
                    ?
                    <div class="w-full h-full justify-center flex flex-row">
                        <Loading></Loading>
                    </div>
                    :
                    <For each={recipes()}>
                        {
                            (recipe, _) => <RecipeCard recipe={recipe} />
                        }
                    </For>}
            </div>
        </div>
    );
}

export default FoodList;