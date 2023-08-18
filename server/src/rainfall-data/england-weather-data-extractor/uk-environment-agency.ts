import { Clock, StandardClock } from "../../util/clock";

export type UkEnvinronmentAgencyRainfallReading = { dateTime: string; measure: string; value: number; };

export interface UkEnvironmentAgency {
    fetchDataOnDay(day: number): UkEnvinronmentAgencyRainfallReading[] | Promise<UkEnvinronmentAgencyRainfallReading[]>;
}

export class UkEnvironmentAgencyAPI implements UkEnvironmentAgency {

    private limitString = "";

    constructor(private clock: Clock = new StandardClock(), private limit?: number) {

    }

    async fetchDataOnDay(day: number) {
        let dataUrl: string;

        if (day === 0) {
            dataUrl = this.assembleUrl(new Date(this.clock.now()));
        } else {
            function daysToMilli(day: number, timeNowMillis: number): number {
                const hoursInDay = 24;
                const minsInHour = 60;
                const secsInMin = 60;
                const msInSecond = 1000;
                return timeNowMillis + day * hoursInDay * minsInHour * secsInMin * msInSecond;
            }
            const date = new Date(daysToMilli(day, this.clock.now()));
            dataUrl = this.assembleUrl(date);
        }
        const data = await (await fetch(dataUrl)).json() as unknown as {items: UkEnvinronmentAgencyRainfallReading[]};
        return data.items;
    }

    private assembleUrl(date: Date) {
        function addLeadingZero(num: string): string {
            if (num.length < 2) {
                return "0" + num
            }
            return num
        }
        const year = (date.getFullYear()).toString();
        const month = addLeadingZero((date.getMonth() + 1).toString());
        const dayOfTheMonth = addLeadingZero(date.getDate().toString());
        
        this.setLimitString();

        const dataUrl = "http://environment.data.gov.uk/flood-monitoring/data/readings?parameter=rainfall&date=" + year + "-" + month + "-" + dayOfTheMonth + this.limitString;
        return dataUrl;
    }

    private setLimitString() {
        if (this.limit !== undefined) {
            this.limitString = "&_limit=" + this.limit.toString();
        }
    }
}




