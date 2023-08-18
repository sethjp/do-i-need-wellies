import { Location } from '../../src/util/location';
import { RainLevel } from '../../src/util/rain/rain-level/rain-level';
import { Rainfall } from '../../src/util/rain/rainfall/rainfall';
import { WeatherProvider } from '../../src/rainfall-data/weather-provider-subsystem/weather-provider';
import { WellyAnswer } from '../../src/welly-expert-subsystem/welly-expert/welly-answer';
import { WellyDecider } from '../../src/welly-expert-subsystem/welly-decider';
// import { TotalRainfallThresholdMudModel } from '../../src/welly-expert-subsystem/mud-model/total-rainfall-mud-model';
import { AccumulativeRainfallMudModel } from '../../src/welly-expert-subsystem/mud-model/accumulative-rainfall-mud-model';
import { ThresholdMudRatingWellyExpert } from '../../src/welly-expert-subsystem/welly-expert/mud-rating-threshold-welly-expert';

let weatherProvider: StubWeatherProvider;

const VERY_HEAVY_RAIN = RainLevel.ofMillimeters(1000);
const NO_RAIN = RainLevel.NONE;

describe("Welly Decider tells you how likely it is you need wellies at a given location", () => {
    it("Says you need wellies at a location where there is lots of rain for the past month", async () => {
        const location = aValidLocation();
        
        SetRainfall.at(location).to(VERY_HEAVY_RAIN).betweenDays(-30, 0);
        
        await expectToNeedWelliesAt(location);
    });

    it("Says you don't need wellies at a location where there has been no rain at all for the past year", async () => {
        const location = aValidLocation();

        SetRainfall.at(location).to(NO_RAIN).betweenDays(-365, 0);

        await expectNotToNeedWelliesAt(location);
    });
})

// ------ fixture ------

function aValidLocation() {
    return new Location(0, 0);
}

async function expectToNeedWelliesAt(location: Location) {
    const wellyDecider = setUpWellyDecider();
    expect(wellyDecider.doINeedWelliesFor(weatherProvider.rainfallAt(location))).toBe(WellyAnswer.WELLIES_NEEDED);
}

async function expectNotToNeedWelliesAt(location: Location) {
    const wellyDecider = setUpWellyDecider();
    expect(wellyDecider.doINeedWelliesFor(weatherProvider.rainfallAt(location))).toBe(WellyAnswer.WELLIES_NOT_NEEDED);
}

function setUpWellyDecider() {
    const mudModel = createMudModel();
    
    const wellyExpert = createWellyExpert();
    
    return new WellyDecider(wellyExpert, mudModel);
}

class StubWeatherProvider implements WeatherProvider {
    constructor(
        private rainfall: Rainfall[]
    ) {
    }

    rainfallAt(_location: Location): Rainfall[] {
        return this.rainfall;
    }
    
}

class SetRainfall implements RainLevelSetter, WhenRainFellSetter {
    private constructor(
        private location: Location, 
        private rainLevel?: RainLevel
    ) {
    }
    
    static at(location: Location): RainLevelSetter {
        return new SetRainfall(location);
    }

    to(rainLevel: RainLevel): WhenRainFellSetter {
        return new SetRainfall(this.location, rainLevel);
    }
    
    betweenDays(startDay: number, endDay: number): void {
        const rainfall: Rainfall[] = []
        for (let i = startDay; i < endDay; i++) {
            if (this.rainLevel == undefined) {
                throw new Error("Rainlevel is undefined.");
            }
            rainfall.push(new Rainfall(this.rainLevel, i));
        }
        weatherProvider = new StubWeatherProvider(rainfall);
    }

}

interface RainLevelSetter {
    to(rainLevel: RainLevel): WhenRainFellSetter;
}

interface WhenRainFellSetter {
    betweenDays(startDay: number, endDay: number): void;
}


function createWellyExpert() {
    const mudRatingThreshold = 50;
    const wellyExpert = new ThresholdMudRatingWellyExpert(mudRatingThreshold);
    return wellyExpert;
}

function createMudModel() {
    // const totalRainfallThreshold = 100;
    // const mudModel = new TotalRainfallThresholdMudModel(totalRainfallThreshold);
    const mudModel = new AccumulativeRainfallMudModel();
    return mudModel;
}

