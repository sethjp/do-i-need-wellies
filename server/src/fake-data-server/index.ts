import { LocalExpert } from "../local-expert";
import { WeatherProvider } from "../rainfall-data/weather-provider-subsystem/weather-provider";
import { Location } from "../util/location";
import { Rainfall } from "../util/rain/rainfall/rainfall";
import { wellyDecider } from "../set-up";
import { RainLevel } from "../util/rain/rain-level/rain-level";
import { App } from "../express-server/app";

class SingleValueWeatherProvider implements WeatherProvider {
    
    constructor(private rainLevel: RainLevel) {
    }

    rainfallAt(_location: Location): Rainfall[] | Promise<Rainfall[]> {
        const rainfallArray: Rainfall[] = []
    
        for (let i = -30; i < 0; i++) {
            rainfallArray.push(new Rainfall(this.rainLevel, getDate(i).getTime()));
        }
        
        return rainfallArray    
    }

}

class RandomRainfallWeatherProvider implements WeatherProvider {
    constructor(private maximumRainfall: number) {
    }

    rainfallAt(_location: Location): Rainfall[] | Promise<Rainfall[]> {
        const rainfallArray: Rainfall[] = []
    
        for (let i = -30; i < 0; i++) {
            rainfallArray.push(new Rainfall(RainLevel.ofMillimeters(Math.random()*this.maximumRainfall), getDate(i).getTime()));
        }
        
        return rainfallArray    
    }
}

class SkewedRandomRainfallWeatherProvider implements WeatherProvider {
    constructor(private averageRainfall: number, private variance: number) {
    }

    private generateRandomNumberOnBellCurve(): number {
        const u1 = Math.random();
        const u2 = Math.random();
        
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // Scale and shift the generated value based on the desired average and variance
        let scaledValue = z0 * Math.sqrt(this.variance) + this.averageRainfall;
        
        scaledValue = scaledValue < 0? 0 : scaledValue

        return scaledValue;

    }

    rainfallAt(_location: Location): Rainfall[] | Promise<Rainfall[]> {
        const rainfall: Rainfall[] = [];

        for (let i = -30; i < 0; i++) {
            const rainLevel = RainLevel.ofMillimeters(this.generateRandomNumberOnBellCurve())
            rainfall.push(new Rainfall(rainLevel, getDate(i).getTime()));
        }

        return rainfall;
    }
}

function getDate(daysAgo: number): Date {
    const date = new Date();
    const currentDate = date.getDate();
    if (daysAgo > 0) {
        daysAgo = -daysAgo
    }
    date.setDate(currentDate + daysAgo);
    return date;
}   

const rainfallEveryWhereWeatherProvider = new SingleValueWeatherProvider(RainLevel.ofMillimeters(20));
rainfallEveryWhereWeatherProvider;


const maximumRainfall = 120;
const randomRainfallWeatherProvider = new RandomRainfallWeatherProvider(maximumRainfall);
randomRainfallWeatherProvider;

const averageRainfall = 2;
const variance = 80;
const bellCurveRainfallWeatherProvider = new SkewedRandomRainfallWeatherProvider(averageRainfall, variance);

const fakeLocalExpert = new LocalExpert(
    bellCurveRainfallWeatherProvider, 
    wellyDecider
);


const app = new App(fakeLocalExpert);

app.listen();