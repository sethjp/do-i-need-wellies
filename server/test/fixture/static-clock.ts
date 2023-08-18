import { Clock } from "../../src/util/clock";



export class StaticClock implements Clock {
    constructor(private time: number) { }
    now(): number {
        return this.time;
    }

}
