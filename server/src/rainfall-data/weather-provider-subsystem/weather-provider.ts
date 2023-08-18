import { Location } from "../../util/location";
import { Rainfall } from "../../util/rain/rainfall/rainfall";


interface RainfallProvider {
    rainfallAt(location: Location): Rainfall[] | Promise<Rainfall[]>;
}

export interface WeatherProvider extends RainfallProvider {
}
