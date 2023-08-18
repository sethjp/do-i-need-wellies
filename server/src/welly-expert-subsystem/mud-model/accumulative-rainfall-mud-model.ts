import { MudModel, MudRating } from ".";
import { Rainfall } from "../../util/rain/rainfall/rainfall";

export class AccumulativeRainfallMudModel implements MudModel {
    mudRatingFor(rainfall: Rainfall[]): MudRating {
        let rating = 0;
        rainfall.forEach(rainfall => {
            rating += rainfall.amount.millimetres / 10
            rating -= 1;
            rating = rating < 0 ? 0 : rating;
        })   
        return MudRating.of(rating);
    }
}