import { ThresholdMudRatingWellyExpert } from './welly-expert/mud-rating-threshold-welly-expert';
import { TotalRainfallThresholdMudModel } from './mud-model/total-rainfall-mud-model';
import { WellyDecider } from './welly-decider';


export function createWellyDecider() {
    const wellyExpert = new ThresholdMudRatingWellyExpert(50);
    const mudModel = new TotalRainfallThresholdMudModel(100);

    return new WellyDecider(wellyExpert, mudModel);
}
