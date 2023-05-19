import { useNavigate } from '@solidjs/router';
import { Component, createMemo, createSignal, For } from 'solid-js';
import star_black from "./assets/icons/star-black.svg";
import star from "./assets/icons/star-yellow.svg";
import { API_BASE_URL } from './constants';

const timeRegex = new RegExp("^\\d\\d:\\d\\d$");


const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

const AddFood: Component = () => {
    const [ingredients, setIngredients] = createSignal<Array<string>>([]);
    const [stars, setStars] = createSignal(5);
    const [title, setTitle] = createSignal("");
    const [description, setDescription] = createSignal("");
    const [time, setTime] = createSignal("00:00");
    const [cost, setCost] = createSignal("1");

    const costValid = createMemo(() => parseInt(cost()));
    const timeValid = createMemo(() => timeRegex.test(time()));
    const titleValid = createMemo(() => description().length > 0);
    const descValid = createMemo(() => title().length > 0);
    const formValid = createMemo(() => titleValid() && descValid() && costValid() && timeValid());

    const navigate = useNavigate();

    const postRecipe = async (data: {
        title: string,
        description: string,
        rating: number,
        time: number,
        cost: number,
        ingredients: Array<string>,
        image_blob?: string
    }) => {
        return await fetch(API_BASE_URL + "/recipe", {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify(data)
        });
    };

    let ingredientField: HTMLInputElement | undefined;
    let imageField: HTMLInputElement | undefined;

    const timeToMinutes = (time: string): number => {
        const parts = time.split(":");
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        return hours * 60 + minutes;
    };

    const submit = async () => {
        const file = imageField?.files?.item(0);
        const contents = await file?.arrayBuffer();
        let image: string | undefined;
        if (contents) {
            image = arrayBufferToBase64(contents);
        } else {
            image = undefined;
        }
        const response = await postRecipe({
            title: title(),
            description: description(),
            rating: stars(),
            time: timeToMinutes(time()),
            cost: parseInt(cost()),
            ingredients: ingredients(),
            image_blob: image
        });
        if (response.ok) {
            navigate("/");
        }
    };

    return (<div class="p-20 flex flex-row justify-center">
        <div class="w-1/3">
            <div class="flex flex-row items-center justify-between mb-8">
                <h1 class="text-4xl">New recipe</h1>
                <button disabled={!formValid()} class="bg-lime-400 hover:bg-lime-600 active:bg-lime-300 disabled:bg-slate-300 disabled:text-slate-600 rounded-2xl p-4 text-lg font-bold text-black transition-all" onClick={submit}>Create Recipe</button>
            </div>
            <div class="flex flex-col p-6">
                <span class="text-lg">Title</span>
                <input type="text" class="bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2" onInput={e => setTitle(e.target.value)} />
            </div>
            <div class="flex flex-col p-6">
                <span class="text-lg">Description</span>
                <textarea rows="3" class="bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2 resize-none" onInput={e => setDescription(e.target.value)} />
            </div>
            <div class="flex flex-col p-6">
                <span class="text-lg">Image</span>
                <input ref={imageField} type="file" accept="image/png, image/jpeg" class="bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2" />
            </div>
            <div class="flex flex-col p-6">
                <span class="text-lg">Rating</span>
                <div class="flex flex-row justify-center">
                    <div class="flex flex-row p-2">
                        <img draggable={false} src={stars() > 0.5 ? star : star_black} class="h-8" onClick={() => setStars(1)} />
                        <img draggable={false} src={stars() > 1.5 ? star : star_black} class="h-8" onClick={() => setStars(2)} />
                        <img draggable={false} src={stars() > 2.5 ? star : star_black} class="h-8" onClick={() => setStars(3)} />
                        <img draggable={false} src={stars() > 3.5 ? star : star_black} class="h-8" onClick={() => setStars(4)} />
                        <img draggable={false} src={stars() > 4.5 ? star : star_black} class="h-8" onClick={() => setStars(5)} />
                    </div>
                </div>
            </div>
            <div class="flex flex-row p-6">
                <div class="flex flex-col">
                    <span class="text-lg">Time (HH:MM)</span>
                    <input type="text" value={time()} class="bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2 w-full" onInput={e => setTime(e.target.value)} />
                </div>
                <div class="w-8"></div>
                <div class="flex flex-col">
                    <span class="text-lg">Cost (€)</span>
                    <input type="number" value={cost()} class="bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2 w-full" onInput={e => setCost(e.target.value)} />
                </div>
            </div>
            <div class="flex flex-col p-6">
                <span class="text-lg">Ingredients</span>
                <div class="flex flex-row">
                    <input ref={ingredientField} type="text" class="flex-grow bg-slate-100 p-2 rounded-lg border-slate-300 border-solid border-2" />
                    <button class="bg-lime-400 hover:bg-lime-600 active:bg-lime-300 rounded-xl p-3 font-bold text-black transition-all ml-4" onClick={() => {
                        let newIngredient = ingredientField?.value;
                        if (newIngredient) {
                            setIngredients([newIngredient, ...ingredients()]);
                            ingredientField!.value = "";
                        }
                    }}>Add</button>
                </div>
                <ul class="m-4">
                    <For each={ingredients()}>
                        {
                            (el, _i) => <li class="list-disc list-inside m-2 text-lg">{el}</li>
                        }
                    </For>
                </ul>
            </div>
        </div>
    </div >)
};

export default AddFood;