import { MudRating } from "../mud-model";
import { WellyAnswer } from "./welly-answer";

export interface WellyExpert {
    doINeedWelliesFor(mudRating: MudRating): WellyAnswer;
}

