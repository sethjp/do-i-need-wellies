This is an SQL statement to get the daily total rainfall over the last 30 days for a specific location.

``` SQL
SELECT
    DATE_TRUNC('day', r.measured_at) AS measurement_date,
    SUM(r.rainfall_mm) AS total_rainfall
FROM
    Rainfall r
JOIN
    WeatherStation w ON w.id = r.weather_station_id
WHERE
    w.latitude = {latitude_value}
    AND w.longitude = {longitude_value}
    AND r.measured_at >= NOW() - INTERVAL '30 days'
GROUP BY
    measurement_date
ORDER BY
    measurement_date;
```
---


This SQL SELECT statement truncates r.measured_at by day and returns the measurement_date field. 

> DATE_TRUNC('day', 2023-06-26T15:52:27Z) --yields-> 2023-06-26 00:00:00

SUM(r.rainfall) AS total_rainfall sums the amount of rainfall grouped by the day to produce the daily total rainfall.

The SQL statement selects from the Rainfall table joined with the WeatherStation table where the weather station ids are the same.

The SQL statement will select only the rows where the latitude and the longitude value match the given latitude and longitude.

The SQL statement also only selects the rows where the data is measured on a date 30 days ago or less.

The rows are grouped by the measurement date and then ordered by the measurement date. 

---

This is an SQL statement for finding the daily total rainfall over the last 30 days for the closest location to a given location.


```SQL
SELECT
    DATE_TRUNC('day', r.measured_at) AS measurement_date,
    SUM(r.rainfall_mm) AS total_rainfall
FROM
    Rainfall r
INNER JOIN (
    SELECT id
    FROM WeatherStation
    ORDER BY
        ($1 - latitude)^2 + ($2 - longitude)^2
    LIMIT 1) AS closest
ON 
    closest.id = r.weather_station_id
WHERE
    r.measured_at >= NOW() - INTERVAL '30 days'
GROUP BY
    measurement_date
ORDER BY
    measurement_date;
```

