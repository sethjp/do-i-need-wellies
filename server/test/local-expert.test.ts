import { Rainfall } from '../src/util/rain/rainfall/rainfall';
import { RainLevel } from '../src/util/rain/rain-level/rain-level';

import { WellyDecider } from '../src/welly-expert-subsystem/welly-decider';
import { WellyAnswer } from '../src/welly-expert-subsystem/welly-expert/welly-answer';

import { TotalRainfallThresholdMudModel } from '../src/welly-expert-subsystem/mud-model/total-rainfall-mud-model';

import { WeatherProvider } from '../src/rainfall-data/weather-provider-subsystem/weather-provider';
import { EnglishWeatherProvider } from '../src/rainfall-data/weather-provider-subsystem/english-weather-provider/english-weather-provider';

import { ThresholdMudRatingWellyExpert } from '../src/welly-expert-subsystem/welly-expert/mud-rating-threshold-welly-expert';

import { DatabaseConnectionProvider } from '../src/rainfall-data/connection-provider';
import { PostgresConnectionProvider } from '../src/rainfall-data/connection-provider/postgres-connection-provider';
import { Pool, PoolConfig } from 'pg';
import { CREATE_WEATHER_STATION_TABLE, CREATE_RAINFALL_TABLE, DROP_RAINFALL_TABLE, DROP_WEATHER_STATION_TABLE } from './fixture/default-sql-commands';
import { STORE_RAINFALL } from '../src/rainfall-data/weather-provider-subsystem/default-queries';

import { Clock } from '../src/util/clock';
import { daysToMilliseconds } from "./weather-provider-subsystem/england-weather-data-extractor/fixture/daysToMilliseconds";

import { LocationWithId, createLocation } from './fixture/location-generator';
import { NO_RAIN, VERY_HEAVY_RAIN, globalStaticClock } from './fixture/constants';

// ---- Test Case ----


describe("The local expert determines how likely it is that wellies are needed or not for a given location", () => {
    it("when there is very heavy rain for a month in a location, wellies will be needed at that location", async () => {
        const location = aValidLocation;
        await SetRainfall.at(location).to(VERY_HEAVY_RAIN).betweenDays(-30, 0);
        expectLocalExpertFor(location).toSayYouNeedWellies();
    });

    it("when there is no rain at a location for a year, wellies will not be needed at that location", async () => {
        const location = aValidLocation;
        await SetRainfall.at(location).to(NO_RAIN).betweenDays(-1, 0);
        expectLocalExpertFor(location).toSayYouDoNotNeedWellies();
    });
});

describe("The local expert tells you the daily weather at a location", () => {
    it("when there is only one rainfall in a day", async () => {
        const location = aValidLocation;
        const dailyRainfall = await SetRainfall.at(location).to(VERY_HEAVY_RAIN).betweenDays(-10, 0);
        expectLocalExpertFor(location).toSayRainfallIs(dailyRainfall);
    })

    it("when there is multiple rain showers in a day", async () => {
        const location = aValidLocation;
        const rainfall1 = await SetRainfall.at(location).to(VERY_HEAVY_RAIN).atTime(globalStaticClock.now());
        const rainfall2 = await SetRainfall.at(location).to(VERY_HEAVY_RAIN).atTime(globalStaticClock.now() + oneHour);
        const dailyRainfallTotal = createDailyTotalRainfall([rainfall1, rainfall2]);
        expectLocalExpertFor(location).toSayRainfallIs(dailyRainfallTotal)
    })
})

// ---- fixture ----

let wellyDecider: WellyDecider;
let databaseConnectionProvider: DatabaseConnectionProvider;
let aValidLocation: LocationWithId;
let weatherProvider: WeatherProvider;

const oneHour = 60*60*1000;

beforeAll(async () => {
    const config: PoolConfig = {
        user: "test",
        database: "rainfall_test_db",
        password: "test-password",
        port: 5432,
        host: "localhost"
    };
    const pool: Pool = new Pool(config);
    databaseConnectionProvider = new PostgresConnectionProvider(pool)
    
    weatherProvider = new EnglishWeatherProvider(databaseConnectionProvider, 1_000_000)

    wellyDecider = createThresholdWellyDeciderSystem();

    await databaseConnectionProvider.query(CREATE_WEATHER_STATION_TABLE);

    aValidLocation = createLocation.at(0, 0);
    await aValidLocation.storeLocation(databaseConnectionProvider);
})

beforeEach(async () => {
    await databaseConnectionProvider.query(CREATE_RAINFALL_TABLE);
})

afterEach(async () => {
    await databaseConnectionProvider.query(DROP_RAINFALL_TABLE);
})

afterAll(async () => {
    await databaseConnectionProvider.query(DROP_WEATHER_STATION_TABLE);
    await databaseConnectionProvider.closeConnection();
})

function createThresholdWellyDeciderSystem() {
    const totalRainfallThreshold = 100;
    const mudModel = new TotalRainfallThresholdMudModel(totalRainfallThreshold);
    
    const mudRatingThreshold = 50;
    const wellyExpert = new ThresholdMudRatingWellyExpert(mudRatingThreshold);
    
    return new WellyDecider(wellyExpert, mudModel);
}

function createDailyTotalRainfall(rainfall: Rainfall[]): Rainfall[] {
    const rainfallSortedByDate = rainfall.sort((a: Rainfall, b: Rainfall) => {
        return a.fellOn.getTime() - b.fellOn.getTime();
    });

    const rainfallByDay = rainfallSortedByDate.map(rainfall => {
        const date = rainfall.fellOn
        date.setUTCHours(0, 0, 0, 0);
        return new Rainfall(rainfall.amount, date.getTime());
    });

    const impossibleTime = 1;
    let previousDate = new Date(impossibleTime);

    let dailyTotalRainfall: Rainfall[] = []

    rainfallByDay.forEach(rainfall => {
        if (rainfall.fellOn.toISOString() != previousDate.toISOString()) {
            previousDate = rainfall.fellOn;
            dailyTotalRainfall.push(rainfall);
        } else {
            const previousRainfall = dailyTotalRainfall.pop()
            if (!previousRainfall) {
                throw new Error("Tried to perform .pop() on an empty array, dailyTotalRainfall.")
            }
            dailyTotalRainfall.push(new Rainfall(RainLevel.ofMillimeters(rainfall.amount.millimetres + previousRainfall.amount.millimetres), previousDate.getTime()));
        }
    })

    return dailyTotalRainfall;
}

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
    
    async betweenDays(startDay: number, endDay: number) {
        const storedRainfall: Rainfall[] = [];
        for (let day = startDay; day < endDay; day++) {
            if (this.rainLevel == undefined) {
                throw new Error("Rainlevel is undefined.");
            }

            const rainfall = new Rainfall(this.rainLevel, this.clock.now() + daysToMilliseconds(day));

            await this.store(rainfall);

            storedRainfall.push(rainfall);
        }
        return storedRainfall
    }

    async atTime(time: number) {
        if (this.rainLevel == undefined) {
            throw new Error("Rainlevel is undefined.");
        }

        const rainfall = new Rainfall(this.rainLevel, time);

        await this.store(rainfall);

        return rainfall;
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
    betweenDays(startDay: number, endDay: number): Rainfall[] | Promise<Rainfall[]>;
    atTime(day: number): Rainfall | Promise<Rainfall>;
}


import { Location } from '../src/util/location';
import { LocalExpert } from '../src/local-expert';

class RainfallTester {
    constructor(private location: Location, private localExpert: LocalExpert) {

    }

    async toSayRainfallIs(rainfall: Rainfall[]) {
        expect((await this.localExpert.localInformationFor(this.location)).rainfall).toEqual(rainfall);
        return this
    }

    async toSayYouNeedWellies() {
        expect((await this.localExpert.localInformationFor(this.location)).wellyNecessityRating).toBe(WellyAnswer.WELLIES_NEEDED);
        return this
    }
    
    async toSayYouDoNotNeedWellies() {
        expect((await this.localExpert.localInformationFor(this.location)).wellyNecessityRating).toBe(WellyAnswer.WELLIES_NOT_NEEDED);
        return this
    }
}

function expectLocalExpertFor(location: LocationWithId) {
    return new RainfallTester(location.position, new LocalExpert(weatherProvider, wellyDecider));
}