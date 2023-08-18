import { DatabaseConnectionProvider } from "../connection-provider";
import { UkEnvironmentAgencyAPI } from "./uk-environment-agency";
import { DatabaseEnglishWeatherStore, EnglishWeatherStore, EnglandWeatherDataExtractor } from "./england-weather-data-extractor";
import { Pullable } from "./pullable";


export function createEnglishWeatherDataExtractorSubsystem(databaseConnectionProvider: DatabaseConnectionProvider) {
    const englishWeatherStore = createDatabaseEnglishWeatherStore(databaseConnectionProvider);
    return createEnglishWeatherDataExtractor(englishWeatherStore) as Pullable;
}

export function createDatabaseEnglishWeatherStore(databaseConnectionProvider: DatabaseConnectionProvider) {
    return new DatabaseEnglishWeatherStore(databaseConnectionProvider);
}

function createEnglishWeatherDataExtractor(englishWeatherStore: EnglishWeatherStore) {
    const ukEnvironmentAgency = new UkEnvironmentAgencyAPI();
    return new EnglandWeatherDataExtractor(ukEnvironmentAgency, englishWeatherStore);
}
