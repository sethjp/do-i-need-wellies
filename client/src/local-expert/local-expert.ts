import { Location } from "../util/location";
import { RainLevel } from "../util/rain/rain-level/rain-level";
import { Rainfall } from "../util/rain/rainfall/rainfall";

export class LocalReport {
    constructor(private wellyNecessityRating: WellyNecessityRating, private weatherReport: WeatherReport) {

    }

    doINeedWellies() {
        return this.wellyNecessityRating;    
    }

    weather() {
        return this.weatherReport;
    }

}

export class WellyNecessityRating {
    constructor(private _wellyRating: number) {
    
    }
    
    get maxRating() {
        return 10;
    }

    get necessityRating() {
        return this._wellyRating;
    }
    
};

export class WeatherReport {
    constructor(private rainfallData: Rainfall[]) {

    }
    
    get rainfall(): Rainfall[] {
        return this.rainfallData;
    }

    
    private insertMissingRainfall(dailyRainfall: Rainfall[]) {
        const today = 0;
        const fourteenDaysAgo = -14;

        const rainfall: Rainfall[] = [];

        for (let i = fourteenDaysAgo; i < today; i++) {
            const date = this.getDate(i);
            const dayOfRainfall = dailyRainfall.find(rainfall => date.getDate() === rainfall.fellOn.getDate());
            if (dayOfRainfall) {
                rainfall.push(dayOfRainfall);
            } else {
                const missingDayOfRainfall = new Rainfall(RainLevel.ofMillimeters(0), date.getTime());
                rainfall.push(missingDayOfRainfall);
            }
        }
        return rainfall;
    }

    private getDate(daysAgo: number): Date {
        const date = new Date();
        const currentDate = date.getDate();
        if (daysAgo > 0) {
            daysAgo = -daysAgo
        }
        date.setDate(currentDate + daysAgo);
        return date;
    }  


    get dailyTotalRainfall(): Rainfall[] {
        const dailyTotalRainfall: Rainfall[] = []        
        this.rainfallData.forEach(rainfall => {
            const date = new Date(rainfall.fellOn.toISOString().split("T")[0]);
            const index = dailyTotalRainfall.findIndex(rainfall => JSON.stringify(rainfall.fellOn) === JSON.stringify(date));
            const doesNotExist = -1
            if (index === doesNotExist) {
                dailyTotalRainfall.push(new Rainfall(rainfall.amount, date.getTime()));
            } else {
                const currentTotal = dailyTotalRainfall[index];
                dailyTotalRainfall[index] = new Rainfall(RainLevel.ofMillimeters(currentTotal.amount.millimetres + rainfall.amount.millimetres), date.getTime());
            }
        });
 
        return (JSON.stringify(dailyTotalRainfall) !== "[]")? this.insertMissingRainfall(dailyTotalRainfall): [];

        // return dailyTotalRainfall;
    }
}




export interface LocalExpert {
    localInformationAt(location: Location): Promise<LocalReport>;
}

type ServerRainfallData = {
    rainfall_mm: number;
    fellOn: string;
};
        
type ServerData = {
    rainfall: ServerRainfallData[];
    wellyNecessityRating: number;
}

export class HttpLocalExpert implements LocalExpert {   

    constructor(private endpoint: string) {}
        
    async localInformationAt(location: Location) {
        
        const serverData = await this.fetchDataAt(location);

        const wellyNecessityRating = this.createWellyNecessityRating(serverData);

        const weatherReport = this.createWeatherReport(serverData);

        return new LocalReport(wellyNecessityRating, weatherReport);
    }
    
    private async fetchDataAt(location: Location) {
        const formData = {latitude: location.latitude, longitude: location.longitude}

        const fetchConfig = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        }

        return await (await fetch(this.endpoint, fetchConfig)).json() as unknown as ServerData
    }

    private createWellyNecessityRating(wellyNecessityRating: {wellyNecessityRating: number}) {
        return new WellyNecessityRating(wellyNecessityRating.wellyNecessityRating)
    }

    private createWeatherReport(serverData: {rainfall: ServerRainfallData[]}) {
        function toTime(isoString: string) {
            return new Date(isoString).getTime();
        }
    
        const rainfallData = serverData.rainfall.map(rainfall => {
            return new Rainfall(RainLevel.ofMillimeters(rainfall.rainfall_mm), toTime(rainfall.fellOn));
        });

        return new WeatherReport(rainfallData);
    }

}



