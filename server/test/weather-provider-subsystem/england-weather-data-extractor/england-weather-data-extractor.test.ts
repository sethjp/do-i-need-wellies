import { Clock } from "../../../src/util/clock";
import { RainLevel } from "../../../src/util/rain/rain-level/rain-level";
import { ARBITRARY_DAY, VERY_HEAVY_RAIN } from "../../fixture/constants";
import { UkEnvironmentAgency } from "../../../src/rainfall-data/england-weather-data-extractor/uk-environment-agency";
import { EnglandWeatherDataExtractor, EnglishWeatherStore } from '../../../src/rainfall-data/england-weather-data-extractor/england-weather-data-extractor';
import { Rainfall } from "../../../src/util/rain/rainfall/rainfall";
import { StaticClock } from "../../fixture/static-clock";
import { StubUkEnvironmentAgency } from "./fixture/stub-uk-environment-agency";
import { daysToMilliseconds } from "./fixture/daysToMilliseconds";
import { LocationWithId, createLocation } from "../../fixture/location-generator";




describe("The England Weather Data extractor pulls data from a source and extracts the relevant data", () => {
    it("pulls a single piece of data and extracts the relevant data", async () => {
        const location = createLocation.at(0, 0);
        SetRainfallSource.at(location).to(VERY_HEAVY_RAIN).onDay(ARBITRARY_DAY);
        await pullData();
        expectVeryHeavyRainAt(location, ARBITRARY_DAY);
    })
})


// ---- fixture ----

let ukEnvironmentAgency: UkEnvironmentAgency;
let trackingEnglishWeatherStore: TrackingEnglishWeatherStore;

function expectVeryHeavyRainAt(location: LocationWithId, day: number) {
    expect(trackingEnglishWeatherStore.items).toEqual([{
        rainfall: new Rainfall(VERY_HEAVY_RAIN, new Date(globalClock.now() + daysToMilliseconds(day)).getTime()),
        stationId: location.id,
    }]);
}

async function pullData() {
    trackingEnglishWeatherStore = new TrackingEnglishWeatherStore();
    const englandWeatherDataExtractor = new EnglandWeatherDataExtractor(ukEnvironmentAgency, trackingEnglishWeatherStore);
    await englandWeatherDataExtractor.pull();
}

class TrackingEnglishWeatherStore implements EnglishWeatherStore {
    constructor(private trackedItems: { rainfall: Rainfall; stationId: string; }[] = []) {

    }
    
    storeRainfall(rainfallData: { rainfall: Rainfall; stationId: string; }): void | Promise<void> {
        this.trackedItems.push(rainfallData);
    }

    get items() {
        return this.trackedItems;
    }

}

class SetRainfallSource implements RainLevelSetter, WhenRainFellSetter {
    private constructor(
        private measure: string, 
        private value?: number,
        private clock: Clock = globalClock,
    ) {
    }
    
    static at(location: LocationWithId): RainLevelSetter {
        const measureString = "http://environment.data.gov.uk/flood-monitoring/id/measures/" + location.id + "-rainfall-tipping_bucket_raingauge-t-15_min-mm"
        return new SetRainfallSource(measureString);
    }

    to(rainLevel: RainLevel): WhenRainFellSetter {
        return new SetRainfallSource(this.measure, rainLevel.millimetres);
    }
    
    onDay(day: number): void {
        if (this.value === undefined) {
            throw new Error("Rain level is not defined");
        }
        
        const dateTime = new Date(this.clock.now() + daysToMilliseconds(day)).toISOString();

        const data = {
            dateTime,
            measure: this.measure,
            value: this.value,
        }

        ukEnvironmentAgency = new StubUkEnvironmentAgency([data])

    }

}

interface RainLevelSetter {
    to(rainLevel: RainLevel): WhenRainFellSetter;
}

interface WhenRainFellSetter {
    onDay(day: number): void;
}

const globalClock = new StaticClock(0);
