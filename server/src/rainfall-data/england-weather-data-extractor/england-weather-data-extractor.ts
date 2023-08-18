import { DatabaseConnectionProvider } from "../connection-provider";
import { RainLevel } from "../../util/rain/rain-level/rain-level";
import { Rainfall } from "../../util/rain/rainfall/rainfall";
import { STORE_RAINFALL } from "../../rainfall-data/weather-provider-subsystem/default-queries";
import { Pullable } from "./pullable";
import { UkEnvinronmentAgencyRainfallReading, UkEnvironmentAgency } from "./uk-environment-agency";

export class EnglandWeatherDataExtractor implements Pullable {
    constructor(private agency: UkEnvironmentAgency, private englishWeatherStore: EnglishWeatherStore) {}

    async pull() {
        const yesterday = -1;
        this.pullSpecificDay(yesterday);
    }
    
    async pullSpecificDay(day: number) {
        const readings = await this.agency.fetchDataOnDay(day);
        const usefulData = this.extractData(readings);
        usefulData.forEach(async (data) => {
            await this.englishWeatherStore.storeRainfall(data)
        });
        console.log("Stored readings for day: " + day);
    }

    private extractData(ukEnvironmentAgencyRainfallReadings: UkEnvinronmentAgencyRainfallReading[]) {
        function stripOutStationId(measure: string): string {
            const parts = measure.split("/");
            const path = parts[parts.length - 1]; 
            if (path === undefined) {
                throw new Error("There is no path defined, cannot get a station id.");
            }
            const id = path.split("-")[0];
            if (id === undefined) {
                throw new Error("Station reference is not defined.");
            }
            
            return id;
        }

        const readings: {rainfall: Rainfall, stationId: string}[] = ukEnvironmentAgencyRainfallReadings.map(reading => {
            const rainLevel = RainLevel.ofMillimeters(reading.value);
            const fellOn = new Date(reading.dateTime).getTime();
            return {
                rainfall: new Rainfall(rainLevel, fellOn),
                stationId: stripOutStationId(reading.measure)
            };
        });

        return readings;
    }

}

export interface EnglishWeatherStore {
    storeRainfall(rainfallData: {rainfall: Rainfall, stationId: string}): void | Promise<void>;
}

export class DatabaseEnglishWeatherStore implements EnglishWeatherStore {
    
    constructor(private databaseConnection: DatabaseConnectionProvider ) {

    }

    async storeRainfall(rainfallData: {rainfall: Rainfall, stationId: string}): Promise<void> {
        try {
           
            await this.databaseConnection.query(
                 STORE_RAINFALL,
                [rainfallData.rainfall.amount.millimetres, rainfallData.rainfall.fellOn.toISOString(), rainfallData.stationId]
            );
        
        } catch(error) {
//            console.log(rainfallData);
//            console.log("Failed");
//            console.error(error);
        }
    }

}

