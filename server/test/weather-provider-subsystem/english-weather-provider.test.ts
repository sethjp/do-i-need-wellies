import { Rainfall } from "../../src/util/rain/rainfall/rainfall";
import { RainLevel } from "../../src/util/rain/rain-level/rain-level"
import { VERY_HEAVY_RAIN, ARBITRARY_DAY, NO_RAIN } from "../fixture/constants";

import { WeatherProvider } from "../../src/rainfall-data/weather-provider-subsystem/weather-provider";
import { EnglishWeatherProvider } from "../../src/rainfall-data/weather-provider-subsystem/english-weather-provider/english-weather-provider";

import { LocationWithId, createLocation } from "../fixture/location-generator";
import { daysToMilliseconds } from "./england-weather-data-extractor/fixture/daysToMilliseconds";

import { Clock } from "../../src/util/clock";
import { StaticClock } from "../fixture/static-clock";

import { Pool, PoolConfig } from "pg";
import { STORE_RAINFALL } from "../../src/rainfall-data/weather-provider-subsystem/default-queries";
import { CREATE_RAINFALL_TABLE, CREATE_WEATHER_STATION_TABLE, DROP_RAINFALL_TABLE, DROP_WEATHER_STATION_TABLE } from "../fixture/default-sql-commands";
import { DatabaseConnectionProvider } from "../../src/rainfall-data/connection-provider";
import { PostgresConnectionProvider } from "../../src/rainfall-data/connection-provider/postgres-connection-provider";


describe("The English Weather Provider gets the weather for a location within England", () => {  

    it("selects the weather from the right location", async () => {
        const location1 = await initializeLocationAt(0, 0);
        const location2 = await initializeLocationAt(1, 1);
        await SetRainfall.at(location1).to(VERY_HEAVY_RAIN).onDay(ARBITRARY_DAY);
        await SetRainfall.at(location2).to(NO_RAIN).onDay(ARBITRARY_DAY);
        
        await expectNoRainAt(location2);
        await expectVeryHeavyRainAt(location1);
    });
})

// ---- fixture ----


let databaseConnectionProvider: DatabaseConnectionProvider;
let englishWeatherProvider: WeatherProvider;

beforeAll(async () => {
    const poolConfig: PoolConfig = {
        user: "test",
        database: "rainfall_test_db",
        password: "test-password",
        port: 5432,
        host: "localhost"
    };
    const pool = new Pool(poolConfig);
    databaseConnectionProvider = new PostgresConnectionProvider(pool)
    englishWeatherProvider = new EnglishWeatherProvider(databaseConnectionProvider, 1_000_000);



    await databaseConnectionProvider.query(CREATE_WEATHER_STATION_TABLE);
});

beforeEach(async () => {
    await databaseConnectionProvider.query(CREATE_RAINFALL_TABLE);
});

afterEach(async () => {
    await databaseConnectionProvider.query(DROP_RAINFALL_TABLE);
});

afterAll(async () => {
    await databaseConnectionProvider.query(DROP_WEATHER_STATION_TABLE);
    await databaseConnectionProvider.closeConnection();
});

async function initializeLocationAt(x: number, y: number) {
    const location = createLocation.at(x, y);
    await location.storeLocation(databaseConnectionProvider);
    return location;
}

function toTime(day: number) {
    return new Date(
        globalStaticClock.now()
        + daysToMilliseconds(day) 
    ).getTime();
}

async function expectVeryHeavyRainAt(location: LocationWithId) {
    const veryHeavyRainfallOnArbitraryDay = new Rainfall(VERY_HEAVY_RAIN, toTime(ARBITRARY_DAY));
    expect(await englishWeatherProvider.rainfallAt(location.position)).toEqual([veryHeavyRainfallOnArbitraryDay]);
}

async function expectNoRainAt(location: LocationWithId) {
    const noRainfallOnArbitraryDay = new Rainfall(NO_RAIN, toTime(ARBITRARY_DAY));
    expect(await englishWeatherProvider.rainfallAt(location.position)).toEqual([noRainfallOnArbitraryDay]);
}

const globalStaticClock = new StaticClock(0);

class SetRainfall implements RainLevelSetter, WhenRainFellSetter {
    private constructor(
        private locationId: string, 
        private rainLevel?: RainLevel,
        private clock: Clock = globalStaticClock,
    ) {
    }
    
    static at(location: LocationWithId): RainLevelSetter {
        return new SetRainfall(location.id);
    }

    to(rainLevel: RainLevel): WhenRainFellSetter {
        return new SetRainfall(this.locationId, rainLevel);
    }
    
    async onDay(day: number) {
        if (this.rainLevel == undefined) {
            throw new Error("Rainlevel is undefined.");
        }

        const rainfall = new Rainfall(this.rainLevel, this.clock.now() + daysToMilliseconds(day));

        await this.store(rainfall)        
    }

    private async store(rainfall: Rainfall) {
        await databaseConnectionProvider.query(
            STORE_RAINFALL, 
            [rainfall.amount.millimetres, rainfall.fellOn, this.locationId]
        );
    }

}

interface RainLevelSetter {
    to(rainLevel: RainLevel): WhenRainFellSetter;
}

interface WhenRainFellSetter {
    onDay(day: number): void | Promise<void>;
}

