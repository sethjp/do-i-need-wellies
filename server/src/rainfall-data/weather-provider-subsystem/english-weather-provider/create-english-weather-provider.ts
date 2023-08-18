import { PostgresConnectionProvider } from "../../connection-provider/postgres-connection-provider";
import { EnglishWeatherProvider } from "./english-weather-provider";


export function createEnglishWeatherProvider(postgresConnectionProvider: PostgresConnectionProvider) {
    return new EnglishWeatherProvider(postgresConnectionProvider);
}
