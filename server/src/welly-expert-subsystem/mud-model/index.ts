import { Rainfall } from "../../util/rain/rainfall/rainfall";


export interface MudModel {
    mudRatingFor(rainfall: Rainfall[]): MudRating;
}

export class MudRating {
    constructor(private score: number) {}

    static of(score: number) {
        return new MudRating(score);
    }

    get rating() {
        return this.score
    }
}