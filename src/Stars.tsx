import { Component } from "solid-js";
import star_black from "./assets/icons/star-black.svg";
import star from "./assets/icons/star-yellow.svg";

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

export default Stars;