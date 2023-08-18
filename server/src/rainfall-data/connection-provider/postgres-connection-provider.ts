import { Pool } from "pg";
import { DatabaseConnectionProvider } from ".";

export class PostgresConnectionProvider implements DatabaseConnectionProvider {
    constructor(private pool: Pool) {

    }
    
    async query(sql: string, values?: any[] | undefined): Promise<unknown> {
        return (await this.pool.query(sql, values)).rows as unknown;
    }

    async closeConnection() {
        await this.pool.end();
    }
    
}

