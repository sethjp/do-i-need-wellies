import { Rainfall } from './util/rain/rainfall/rainfall';
import { WellyDecider } from './welly-expert-subsystem/welly-decider';
import { WellyAnswer } from './welly-expert-subsystem/welly-expert/welly-answer';
import { WeatherProvider } from './rainfall-data/weather-provider-subsystem/weather-provider';
import { Location } from './util/location';

class LocalReport {
    constructor(private _wellyNecessityRating: WellyAnswer, private _rainfall: Rainfall[]) { }
    get wellyNecessityRating(): WellyAnswer {
        return this._wellyNecessityRating;
    }
    get rainfall(): Rainfall[] {
        return this._rainfall;
    }
}

export class LocalExpert implements LocalExpert {
    constructor(private weatherProvider: WeatherProvider, private wellyDecider: WellyDecider) {
    }
    async localInformationFor(location: Location): Promise<LocalReport> {
        const rainfall = await this.weatherProvider.rainfallAt(location);
        const wellyNecessityRating = this.wellyDecider.doINeedWelliesFor(rainfall);
        return new LocalReport(wellyNecessityRating, rainfall);
    }

}
