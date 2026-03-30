import { Collection } from "discord.js";
import { PrismaClient } from "@prisma/client";
import { Provider, ProviderOptions } from "./Provider";

export default class DatabaseProvider extends Provider {
    private db: PrismaClient;
    private readonly tableName: string;
    private readonly idColumn: string;
    private readonly dataColumn?: string;
    public items: Collection<string, any>;
    private readonly bigInt: boolean;

    constructor(
        db: PrismaClient,
        tableName: string,
        options?: ProviderOptions,
        bigint?: boolean
    ) {
        super();
        this.items = new Collection();
        this.db = db;
        this.tableName = tableName;
        this.idColumn = options?.idColumn ?? "Id";
        this.dataColumn = options?.dataColumn;
        this.bigInt = bigint ?? true;
    }

    async init() {
        const rows = await this.db.$queryRawUnsafe<any[]>(
            `SELECT * FROM ${this.tableName}`
        );

        for (const row of rows) {
            this.items.set(
                String(row[this.idColumn]),
                this.dataColumn ? JSON.parse(row[this.dataColumn]) : row
            );
        }
    }

    get(id: string, key: string, defaultValue: any) {
        if (this.items.has(id)) {
            const value = this.items.get(id)[key];
            return value == null ? defaultValue : value;
        }

        return defaultValue;
    }

    async set(id: string, key: string, value: any) {
        const data = this.items.get(id) || {};
        const exists = this.items.has(id);

        data[key] = value;
        this.items.set(id, data);

        if (this.dataColumn) {
            return this.db.$executeRawUnsafe(
                exists
                    ? `UPDATE ${this.tableName} SET ${this.dataColumn} = ? WHERE ${this.idColumn} = ?`
                    : `INSERT INTO ${this.tableName} (${this.idColumn}, ${this.dataColumn}) VALUES (?, ?)`,
                exists ? data[key] : id,
                exists ? id : data[key]
            );
        }

        return this.db.$executeRawUnsafe(
            exists
                ? `UPDATE ${this.tableName} SET ${key} = ? WHERE ${this.idColumn} = ?`
                : `INSERT INTO ${this.tableName} (${this.idColumn}, ${key}) VALUES (?, ?)`,
            exists ? data[key] : id,
            exists ? id : data[key]
        );
    }

    delete(id: string, key: string) {
        const data = this.items.get(id) || {};
        delete data[key];

        if (this.dataColumn) {
            return this.db.$executeRawUnsafe(
                `UPDATE ${this.tableName} SET ${this.dataColumn} = ? WHERE ${this.idColumn} = ?`,
                JSON.stringify(data),
                id
            );
        }

        return this.db.$executeRawUnsafe(
            `UPDATE ${this.tableName} SET ${key} = ? WHERE ${this.idColumn} = ?`,
            null,
            id
        );
    }

    clear(id: string) {
        this.items.delete(id);
        return this.db.$executeRawUnsafe(
            `DELETE FROM ${this.tableName} WHERE ${this.idColumn} = ?`,
            id
        );
    }
}
