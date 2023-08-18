import { WeatherProvider } from "../weather-provider";
import { DatabaseConnectionProvider } from "../../connection-provider";
import { Rainfall } from "../../../util/rain/rainfall/rainfall";
import { Location } from "../../../util/location";
import { RainLevel } from "../../../util/rain/rain-level/rain-level";
import { GET_RAINFALL_CLOSEST_TO_GIVEN_RECTANGLE_AROUND_A_LOCATION_DAILY_SUM_OVER_GIVEN_PERIOD_OF_TIME } from "../default-queries";


export class EnglishWeatherProvider implements WeatherProvider {
    constructor(private connectionProvider: DatabaseConnectionProvider, private periodOfTimeToCheckDays: number = 30) {}
    
    async rainfallAt(location: Location): Promise<Rainfall[]> {
        const responses = await this.connectionProvider.query(
            GET_RAINFALL_CLOSEST_TO_GIVEN_RECTANGLE_AROUND_A_LOCATION_DAILY_SUM_OVER_GIVEN_PERIOD_OF_TIME, 
            [location.latitude, location.longitude, this.periodOfTimeToCheckDays + ' days']
        ) as { total_rainfall: number, measurement_date: string }[];
        
        const rainfall = responses.map((rainfall_response) => {            
            const anHour = 1 * 60 * 60 * 1000;
            const rainfall = new Rainfall(
                RainLevel.ofMillimeters(rainfall_response.total_rainfall), 
                (new Date(rainfall_response.measurement_date)).getTime() + anHour
            );
            return rainfall;
        })

        return rainfall
        
    }

}