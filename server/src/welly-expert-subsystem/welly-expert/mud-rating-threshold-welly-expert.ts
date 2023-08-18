import { WellyExpert } from ".";
import { MudRating } from "../mud-model";
import { WellyAnswer } from "./welly-answer";

export class ThresholdMudRatingWellyExpert implements WellyExpert {
    constructor(private mudRatingThreshold: number) {}
    
    doINeedWelliesFor(mudRating: MudRating): WellyAnswer {
        return mudRating.rating > this.mudRatingThreshold? WellyAnswer.WELLIES_NEEDED : WellyAnswer.WELLIES_NOT_NEEDED;
    }
}
