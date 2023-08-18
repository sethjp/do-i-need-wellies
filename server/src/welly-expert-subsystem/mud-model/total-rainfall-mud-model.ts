import { MudModel, MudRating } from ".";
import { Rainfall } from "../../util/rain/rainfall/rainfall";

export class TotalRainfallThresholdMudModel implements MudModel {
    constructor(private totalRainfallThreshold: number) {}
    
    mudRatingFor(rainfall: Rainfall[]): MudRating {    
        const totalRainfall = rainfall.reduce(
            (sum, rainfall) => {
                return sum + rainfall.amount.millimetres;
            }, 0);
            
        return totalRainfall > this.totalRainfallThreshold? MudRating.of(100) : MudRating.of(0);
    }
}