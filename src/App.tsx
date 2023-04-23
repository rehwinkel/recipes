import { Component, createMemo, createSignal, For } from 'solid-js';
import food from "./assets/portrait.jpeg";
import missing_food from "./assets/file-remove-outline.svg";
import star_black from "./assets/star-black.svg";
import star from "./assets/star-yellow.svg";
import search_icon from "./assets/magnify.svg";
import money from "./assets/hand-coin-outline.svg";
import time from "./assets/clock-outline.svg";
import styles from "./App.module.css";
import fuzzysort from 'fuzzysort';
import { A, Navigate, Route, Routes, useNavigate, useParams } from '@solidjs/router';

const Stars: Component<{ stars: number }> = (props) => {
    return (
        <div class="flex flex-row">
            <img src={props.stars > 0.5 ? star : star_black} class="h-6" />
            <img src={props.stars > 1.5 ? star : star_black} class="h-6" />
            <img src={props.stars > 2.5 ? star : star_black} class="h-6" />
            <img src={props.stars > 3.5 ? star : star_black} class="h-6" />
            <img src={props.stars > 4.5 ? star : star_black} class="h-6" />
        </div>
    );
};

const RecipeCard: Component<{ recipe: Recipe }> = (props) => {
    const navigate = useNavigate();

    return (
        <div class={styles.foodcard + " max-w-lg md:w-1/2 xl:w-1/3 2xl:w-1/4"}>
            <div onClick={() => navigate("/recipe/" + props.recipe.uid)} class="rounded-2xl shadow-xl m-2 bg-slate-100 hover:shadow-2xl transition-all hover:bg-slate-200 active:bg-slate-300">
                {props.recipe.image
                    ?
                    <img src={props.recipe.image} class="w-full h-auto rounded-t-xl object-cover aspect-video" />
                    :
                    <img src={missing_food} class="aspect-video" />
                }
                <div class="p-6 flex flex-row items-center">
                    <span class="text-xl font-semibold">
                        {props.recipe.name}
                    </span>
                    <div class="flex-grow" />
                    <Stars stars={props.recipe.stars} />
                </div>
            </div>
        </div>
    );
};

interface Recipe {
    uid: string,
    name: string,
    description: string,
    stars: number,
    image?: string,
    timeMinutes?: number,
    priceEuros?: number,
    ingredients: string[]
}

const FoodList: Component = () => {
    const [searching, setSearching] = createSignal(false);
    const [query, setQuery] = createSignal("");
    const [recipes, setRecipes] = createSignal<Array<Recipe>>([
        { name: "Amoma", description: "Tomato", image: food, stars: 3, uid: "1", ingredients: [] },
        { name: "Sugus", description: "Tomato", image: food, stars: 3, uid: "2", ingredients: [] },
        { name: "Mog", description: "Tomato", image: food, stars: 3, uid: "3", ingredients: [] },
        { name: "Meg", description: "Tomato", image: food, stars: 3, uid: "4", ingredients: [] },
        { name: "Sugoma", description: "Tomato", image: food, stars: 3, uid: "5", ingredients: [] },
        { name: "Amongus", description: "Tomato", image: food, stars: 3, uid: "6", ingredients: [] },
        { name: "SUS", description: "Tomato", image: food, stars: 5, uid: "7", ingredients: [] }
    ]);
    const filtered = createMemo(() => fuzzysort.go(query(), recipes(), { keys: ["name", "description"], all: true }).map(e => e.obj));

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
                <For each={filtered()}>
                    {
                        (recipe, _) => <RecipeCard recipe={recipe} />
                    }
                </For>
            </div>
        </div>
    );
}

const AddFood: Component = () => {
    return (<div>addfood</div>)
};

const ShowFood: Component = () => {
    const params = useParams();

    const recipe: Recipe = {
        name: "Lasagna Bolognesa",
        description: "A delicious baked noodle dish. Notoriously takes quite a while to cook. Contains gluten, among other things.",
        stars: 3,
        uid: "abc",
        image: food,
        priceEuros: 3.5,
        timeMinutes: 200,
        ingredients: ["3 tomatoes", "1 head of lettuce", "3 noodles"]
    };

    return (<>
        <div class="md:hidden">
            <img src={recipe.image} class="rounded-b-xl max-h-80 w-full h-auto object-cover aspect-video" />
            <div class="p-8">
                <h1 class="text-4xl flex flex-row" >
                    {recipe.name}
                </h1>
                <div class="mt-2 flex flex-row items-center justify-start" >
                    <Stars stars={recipe.stars} />
                    {
                        recipe.timeMinutes ?
                            <div class="flex flex-row items-center bg-slate-100 p-2 rounded-lg ml-4">
                                <img src={time} class="h-4 mr-2" />
                                <span>3:30h</span>
                            </div> : undefined
                    }
                    {
                        recipe.priceEuros ?
                            <div class="flex flex-row items-center bg-slate-100 p-2 rounded-lg ml-4">
                                <img src={money} class="h-4 mr-2" />
                                <span>3€</span>
                            </div> : undefined
                    }
                </div>
                <p class="mt-4">
                    {recipe.description}
                </p>
                <div class="mt-4">
                    <span class="text-lg">Ingredients</span>
                    <ul class="list-disc list-inside">
                        <For each={recipe.ingredients}>
                            {
                                (ingredient, _) => <li>{ingredient}</li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
        </div>
        <div class="flex max-md:hidden p-20">
            <div class="basis-1/2">
                <h1 class="text-4xl flex flex-row xl:text-6xl" >
                    {recipe.name}
                </h1>
                <div class="mt-2" >
                    <Stars stars={recipe.stars} />
                </div>
                <p class="xl:text-xl mt-4">
                    {recipe.description}
                </p>
                <div class="mt-4">
                    <span class="text-lg xl:text-2xl">Ingredients</span>
                    <ul class="list-disc list-inside">
                        <For each={recipe.ingredients}>
                            {
                                (ingredient, _) => <li class="xl:text-xl">{ingredient}</li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
            <div class="w-8"></div>
            <div class="basis-1/2">
                <img src={recipe.image} class="rounded-xl aspect-video h-auto w-full object-cover" />
                <div class="flex flex-row justify-between">
                    {
                        recipe.timeMinutes ?
                            <div class="flex flex-row items-center bg-slate-100 p-4 rounded-lg m-4">
                                <img src={time} class="h-8 mr-2" />
                                <span class="text-lg">3:30h</span>
                            </div> : undefined
                    }
                    {
                        recipe.priceEuros ?
                            <div class="flex flex-row items-center bg-slate-100 p-4 rounded-lg m-4">
                                <img src={money} class="h-8 mr-2" />
                                <span class="text-lg">3€</span>
                            </div> : undefined
                    }
                </div>
            </div>
        </div>
    </>
    );
};

const App: Component = () => {
    return (
        <Routes>
            <Route path="/" component={FoodList} />
            <Route path="/create" component={AddFood} />
            <Route path="/recipe/:id" component={ShowFood} />
            <Route path="/*" component={() => <Navigate href="/" />} />
        </Routes>
    );
};

export default App;
