export interface Clock {
    now(): number;
}

export class StandardClock implements Clock {
    now(): number {
        return Date.now();
    }
}