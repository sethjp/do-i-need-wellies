import { UkEnvironmentAgency, UkEnvinronmentAgencyRainfallReading } from "../../../../src/rainfall-data/england-weather-data-extractor/uk-environment-agency";



export class StubUkEnvironmentAgency implements UkEnvironmentAgency {
    constructor(private ukEnvironmentAgencyRainfallReading: UkEnvinronmentAgencyRainfallReading[] = []) { }

    fetchDataOnDay(_day: number): UkEnvinronmentAgencyRainfallReading[] {
        return this.ukEnvironmentAgencyRainfallReading;
    }

    addData(data: UkEnvinronmentAgencyRainfallReading) {
        this.ukEnvironmentAgencyRainfallReading.push(data);
    }

}
