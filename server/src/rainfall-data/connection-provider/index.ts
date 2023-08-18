export interface DatabaseConnectionProvider {
    query(sql: string, values?: any[]): unknown | Promise<unknown>;
    closeConnection(): void | Promise<void>;
}