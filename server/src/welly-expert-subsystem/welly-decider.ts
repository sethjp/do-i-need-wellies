import { MudModel } from './mud-model';
import { WellyExpert } from './welly-expert';
import { WellyAnswer } from './welly-expert/welly-answer';
import { Rainfall } from '../util/rain/rainfall/rainfall';


export class WellyDecider {

    constructor(private wellyExpert: WellyExpert, private mudModel: MudModel) {
    }

    doINeedWelliesFor(rainfall: Rainfall[]): WellyAnswer {
        const mudRating = this.mudModel.mudRatingFor(rainfall);
        return this.wellyExpert.doINeedWelliesFor(mudRating);
    }
    
}

