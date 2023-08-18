import dotenv from 'dotenv';
import path from 'path';
import { createEnglishWeatherProvider } from "./rainfall-data/weather-provider-subsystem/english-weather-provider/create-english-weather-provider";
import { createWellyDecider } from "./welly-expert-subsystem/create-welly-decider";
import { createPostgresConnectionProvider } from "./rainfall-data/connection-provider/create-postgres-connection-provider";
import { PoolConfig } from 'pg';
import { LocalExpert } from './local-expert';

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const config: PoolConfig = {
    "user": process.env['PG_USER']?.toString(),
    "database": process.env['DATABASE']?.toString(),
    "password": process.env['PASSWORD']?.toString(),
    "port": Number(process.env['PORT']),
    "host": process.env['HOST']?.toString(),
};

export const connectionProvider = createPostgresConnectionProvider(config);
export const weatherProvider = createEnglishWeatherProvider(connectionProvider);
export const wellyDecider = createWellyDecider();
export const localExpert = new LocalExpert(weatherProvider, wellyDecider);
