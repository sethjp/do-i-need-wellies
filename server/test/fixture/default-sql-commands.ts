export const CREATE_WEATHER_STATION_TABLE = `
    CREATE TABLE WeatherStation (
        id                      SERIAL,
        latitude                FLOAT    NOT NULL,
        longitude               FLOAT    NOT NULL,
        environment_agency_ref  TEXT     NOT NULL,

        PRIMARY KEY(id)     
    );
`;
export const CREATE_RAINFALL_TABLE = `
CREATE TABLE Rainfall (
    id                    SERIAL,
    rainfall_mm           FLOAT      NOT NULL,
    measured_at           TIMESTAMP  NOT NULL,
    weather_station_id    INTEGER    NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_weather_station
    FOREIGN KEY (weather_station_id)
    REFERENCES WeatherStation(id)     
);
`;
export const DROP_RAINFALL_TABLE = `
    DROP TABLE Rainfall;
`;
export const DROP_WEATHER_STATION_TABLE = `
    DROP TABLE WeatherStation;
`;
