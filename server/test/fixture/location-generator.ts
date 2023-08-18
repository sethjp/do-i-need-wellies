import { Location } from "../../src/util/location";
import { DatabaseConnectionProvider } from "../../src/rainfall-data/connection-provider";

// export type LocationWithId = {
//     location: Location;
//     id: string;
// };

export class LocationWithId {
    constructor(private location: Location, private locationId: string) {}

    get position() {
        return this.location;
    }

    get id() {
        return this.locationId;
    }

    async storeLocation(databaseConnectionProvider: DatabaseConnectionProvider) {
        const weatherStation = {location: this.location, id: this.locationId};
        await databaseConnectionProvider.query(
            "INSERT INTO WeatherStation (latitude, longitude, environment_agency_ref) VALUES ($1, $2, $3)",
            [weatherStation.location.latitude, weatherStation.location.longitude, weatherStation.id]
        );
    }

}

export class LocationGenerator {
    private currentLocationNumber: number = 0;

    constructor() {
    }

    at(x: number, y: number): LocationWithId {
        const locationWithId = new LocationWithId(new Location(x, y), "test" + this.currentLocationNumber);
        this.currentLocationNumber += 1;
        return locationWithId;
    }
}


export const createLocation = new LocationGenerator();