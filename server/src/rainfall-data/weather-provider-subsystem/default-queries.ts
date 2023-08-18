export const GET_RAINFALL_AT_EXACT_LOCATION = `
SELECT r.rainfall_mm, r.measured_at
FROM Rainfall r
INNER JOIN WeatherStation ws
    ON (ws.id = r.weather_station_id)
    WHERE latitude = $1 AND longitude = $2
`;

export const GET_RAINFALL_CLOSEST_TO_GIVEN_LOCATION = `
    SELECT r.rainfall_mm, r.measured_at
    FROM Rainfall r
    INNER JOIN (
        SELECT 
            id, 
            ($1 - latitude)^2 + ($2 - longitude)^2 AS distance
        FROM WeatherStation
        ORDER BY
            distance
        LIMIT 1
    ) AS closest
    ON r.weather_station_id = closest.id
`;

/*
 * $1 = latitude of desired location.
 * $2 = longitude of desired location.
 * $3 = number of days of history that rainfall data is selected from.
 */
export const GET_RAINFALL_CLOSEST_TO_GIVEN_LOCATION_DAILY_SUM_OVER_GIVEN_PERIOD_OF_TIME = `
SELECT
    DATE_TRUNC('day', measured_at) AS measurement_date,
    SUM(rainfall_mm) AS total_rainfall
FROM Rainfall
INNER JOIN (
    SELECT ws.id, ws.latitude, ws.longitude
    FROM WeatherStation ws
    INNER JOIN Rainfall r ON (r.weather_station_id = ws.id)
    GROUP BY ws.id
    HAVING COUNT(*) >= 1 -- i.e. 1 rainfall data entry (which we should see even in one day)
    ORDER BY ($1 - latitude)^2 + ($2 - longitude)^2 
    LIMIT 1
) AS closest_weather_station
ON closest_weather_station.id = weather_station_id
WHERE measured_at > NOW() - $3::INTERVAL 
AND rainfall_mm <= 37.5 -- maximum amount of rainfall in 15 mins in mm.
GROUP BY measurement_date
ORDER BY measurement_date;
`;

/*
 * $1 = latitude of desired location.
 * $2 = longitude of desired location.
 * $3 = number of days of history that rainfall data is selected from.
 */
export const GET_RAINFALL_CLOSEST_TO_GIVEN_RECTANGLE_AROUND_A_LOCATION_DAILY_SUM_OVER_GIVEN_PERIOD_OF_TIME = `
SELECT
    DATE_TRUNC('day', measured_at) AS measurement_date,
    SUM(rainfall_mm) AS total_rainfall
FROM Rainfall
INNER JOIN (
    SELECT ws.id, ws.latitude, ws.longitude
    FROM WeatherStation ws
    INNER JOIN Rainfall r ON (r.weather_station_id = ws.id)
    WHERE ABS($1 - ws.latitude) < 0.2
    AND (
        $2 - ws.longitude < 0.15 AND (
            $2 - ws.longitude > 0
        )

    OR
        ws.longitude - $2 < 0.3 AND (
            ws.longitude - $2 >= 0
        )
    )
    GROUP BY ws.id
    HAVING COUNT(*) >= 1 -- i.e. 1 rainfall data entry (which we should see even in one day)
    ORDER BY ($1 - ws.latitude)^2 + ($2 - ws.longitude)^2 
    LIMIT 1
) AS closest_weather_station
ON closest_weather_station.id = weather_station_id
WHERE measured_at > NOW() - $3::INTERVAL 
AND rainfall_mm <= 37.5 -- maximum amount of rainfall in 15 mins in mm.
GROUP BY measurement_date
ORDER BY measurement_date;
`


export const STORE_RAINFALL  = `
    INSERT INTO Rainfall (rainfall_mm, measured_at, weather_station_id) 
    VALUES (
        $1,
        $2,
        (    
            SELECT id
            FROM WeatherStation
            WHERE environment_agency_ref = $3
        )
    );
`