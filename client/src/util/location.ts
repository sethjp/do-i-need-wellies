
export class Location {
    constructor(private lat: number, private long: number) {
    }

    get latitude() {
        return this.lat;
    }

    get longitude() {
        return this.long;
    }

    public distanceFrom(location: Location): number {
        return ((this.latitude - location.latitude) ** 2 + (this.longitude - location.latitude) ** 2) ** 0.5;
    }

    public midpointBetween(location: Location): Location {
        return new Location((this.latitude + location.latitude) / 2, (this.longitude + location.longitude) / 2);
    }

    public equals(other: Location): boolean {
        return this.latitude === other.latitude && this.longitude === other.longitude;
    }
}
