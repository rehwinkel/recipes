import { useParams } from "@solidjs/router";
import { Component, createResource, For, Resource } from "solid-js";
import { Recipe } from "./Recipe";
import money from "./assets/icons/hand-coin-outline.svg";
import time from "./assets/icons/clock-outline.svg";
import missing_food from "./assets/icons/file-remove-outline.svg";
import Stars from "./Stars";
import Loading from "./Loading";
import { API_BASE_URL, IMAGES_BASE_URL } from "./constants";

const timeFromMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const minutesPart = minutes % 60;
    return hours.toString() + ":" + minutesPart.toString().padStart(2, "0") + "h"
};

const WideLayout = ({ recipe }: { recipe: Resource<Recipe> }) => {
    return (
        <>
            <div class="basis-1/2">
                <h1 class="text-4xl flex flex-row xl:text-6xl" >
                    {recipe()!.title}
                </h1>
                <div class="mt-2" >
                    <Stars stars={recipe()!.rating} />
                </div>
                <p class="xl:text-xl mt-4">
                    {recipe()!.description}
                </p>
                <div class="mt-4">
                    <span class="text-lg xl:text-2xl">Ingredients</span>
                    <ul class="list-disc list-inside">
                        <For each={recipe()!.ingredients}>
                            {
                                (ingredient, _) => <li class="xl:text-xl">{ingredient}</li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
            <div class="w-8"></div>
            <div class="basis-1/2">
                {recipe()?.image ?
                    <img src={IMAGES_BASE_URL + "/" + recipe()!.image} class="rounded-xl aspect-video h-auto w-full object-cover" />
                    :
                    <img src={missing_food} class="aspect-video bg-slate-100 rounded-xl" />
                }
                <div class="flex flex-row justify-between">
                    {
                        recipe()!.time ?
                            <div class="flex flex-row items-center bg-slate-100 p-4 rounded-lg m-4">
                                <img src={time} class="h-8 mr-2" />
                                <span class="text-lg">{timeFromMinutes(recipe()?.time ?? 0)}</span>
                            </div> : undefined
                    }
                    {
                        recipe()!.cost ?
                            <div class="flex flex-row items-center bg-slate-100 p-4 rounded-lg m-4">
                                <img src={money} class="h-8 mr-2" />
                                <span class="text-lg">{(recipe()?.cost ?? 0).toFixed(2) + " €"}</span>
                            </div> : undefined
                    }
                </div>
            </div>
        </>
    );
};

const SlimLayout = ({ recipe }: { recipe: Resource<Recipe> }) => {
    return (
        <>
            {recipe()?.image ?
                <img src={IMAGES_BASE_URL + "/" + recipe()!.image} class="max-h-80 w-full h-auto object-cover aspect-video" />
                :
                <img src={missing_food} class="aspect-video bg-slate-100" />
            }
            <div class="p-8">
                <h1 class="text-4xl flex flex-row" >
                    {recipe()?.title}
                </h1>
                <div class="mt-2 flex flex-row items-center justify-start" >
                    <Stars stars={recipe()!.rating} />
                    {
                        recipe()!.time ?
                            <div class="flex flex-row items-center bg-slate-100 p-2 rounded-lg ml-4">
                                <img src={time} class="h-4 mr-2" />
                                <span>{timeFromMinutes(recipe()?.time ?? 0)}</span>
                            </div> : undefined
                    }
                    {
                        recipe()!.cost ?
                            <div class="flex flex-row items-center bg-slate-100 p-2 rounded-lg ml-4">
                                <img src={money} class="h-4 mr-2" />
                                <span>{(recipe()?.cost ?? 0).toFixed(2) + " €"}</span>
                            </div> : undefined
                    }
                </div>
                <p class="mt-4">
                    {recipe()!.description}
                </p>
                <div class="mt-4">
                    <span class="text-lg">Ingredients</span>
                    <ul class="list-disc list-inside">
                        <For each={recipe()!.ingredients}>
                            {
                                (ingredient, _) => <li>{ingredient}</li>
                            }
                        </For>
                    </ul>
                </div>
            </div>
        </>
    );
}

const fetchRecipe = async (id: string) => {
    let data = await fetch(API_BASE_URL + "/recipe/" + id);
    let body = await data.json() as Recipe;
    return body;
}

const ShowFood: Component = () => {
    const params = useParams();

    const [recipe] = createResource(params.id, fetchRecipe);

    const body = () => <>
        <div class="md:hidden">
            <SlimLayout recipe={recipe}></SlimLayout>
        </div>
        <div class="flex max-md:hidden p-20">
            <WideLayout recipe={recipe}></WideLayout>
        </div>
    </>;
    return (<>
        {recipe() === undefined
            ?
            <div class="flex flex-row justify-center items-center w-full h-full"><Loading></Loading></div>
            :
            body()}
    </>)
};

export default ShowFood;