import { Pool, PoolConfig } from "pg";
import { PostgresConnectionProvider } from "./postgres-connection-provider";


export function createPostgresConnectionProvider(postgresConfig: PoolConfig) {
    const pool = new Pool(postgresConfig);
    return new PostgresConnectionProvider(pool);
}
