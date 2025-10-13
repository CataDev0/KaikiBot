import { PrismaClient } from "@prisma/client";
import { ActivityType } from "discord.js";
import {
    createPool,
    FieldPacket,
    Pool, PoolOptions
} from "mysql2/promise";
import KaikiSapphireClient from "../../lib/Kaiki/KaikiSapphireClient";
import process from "process";
import DatabaseProvider from "./DatabaseProvider";
import { green } from "colorette";
import KaikiCache from "../../lib/Cache/KaikiCache";
import { MoneyService } from "../../services/MoneyService";

export default class Database {
    private _client: KaikiSapphireClient<true>;
    public orm: PrismaClient;
    private _mySQLConnection: Pool;

    public constructor(client: KaikiSapphireClient<true>) {
        this._client = client;
    }

    public get mySQLConnection(): Pool {
        return this._mySQLConnection;
    }

    private createConfig(): PoolOptions {
        return {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            host: process.env.DB_HOST,
            port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
            database: process.env.DB_NAME,
            supportBigNumbers: true,
            waitForConnections: true,
        };
    }
    public async init(): Promise<Database> {
        this._mySQLConnection = createPool(this.createConfig());
        this.orm = new PrismaClient();

        const botSettings = await this.orm.botSettings.findFirst();

        if (!botSettings) {
            await this.orm.botSettings.create({
                data: { Id: 1 },
            });
        }

        return this;
    }

    public async getOrCreateGuild(id: string | bigint) {
        const guild = await this.orm.guilds.findUnique({
            where: {
                Id: BigInt(id),
            },
        });

        if (!guild) {
            const newGuild = await this.orm.guilds.create({
                data: {
                    Prefix: String(process.env.PREFIX),
                    Id: BigInt(id),
                },
            });
            this._client.guildsDb.items.set(String(newGuild.Id), newGuild);
            return newGuild;
        }
        return guild;
    }

    public async getOrCreateGuildUser(
        userId: string | bigint,
        guildId: string | bigint
    ) {
        const guildUser = await this.orm.guildUsers.findFirst({
            where: {
                UserId: BigInt(userId),
                GuildId: BigInt(guildId),
            },
        });

        if (!guildUser) {
            return this.orm.guildUsers.create({
                data: {
                    DiscordUsers: {
                        connect: {
                            UserId: BigInt(userId),
                        }
                    },
                    Guilds: {
                        connectOrCreate: {
                            create: {
                                Id: BigInt(guildId),
                            },
                            where: {
                                Id: BigInt(guildId),
                            },
                        }
                    },
                },
            });
        }
        return guildUser;
    }

    public async initializeDatabase() {
        try {
            const database = await this.init();

            this._client.orm = database.orm;
            this._client.connection = database.mySQLConnection;
        }

        catch (e) {
            this._client.logger.error(e)
            process.exit(1);
        }

        this._client.botSettings = new DatabaseProvider(
            this._client.connection,
            "BotSettings",
            { idColumn: "Id" },
            false
        );
        this._client.botSettings
            .init()
            .then(() =>
                this._client.logger.info(
                    `${green("READY")} - Bot settings provider`
                )
            )
            .catch((e) => this.dbRejected(e));

        this._client.guildsDb = new DatabaseProvider(this._client.connection, "Guilds", {
            idColumn: "Id",
        });
        this._client.guildsDb
            .init()
            .then(() =>
                this._client.logger.info(`${green("READY")} - Guild provider`)
            )
            .catch((e) => this.dbRejected(e));

        this._client.dadBotChannels = new DatabaseProvider(
            this._client.connection,
            "DadBotChannels",
            { idColumn: "ChannelId" }
        );
        this._client.dadBotChannels
            .init()
            .then(() =>
                this._client.logger.info(
                    `${green("READY")} - DadBot channel provider`
                )
            )
            .catch((e) => this.dbRejected(e));

        this._client.cache = new KaikiCache(this.orm, this._client.connection, this._client.imageAPIs);
        this._client.money = await new MoneyService(this.orm).init();
    }

    private dbRejected(e: unknown) {
        this._client.logger.fatal("Failed to connect to database using MySQL2.", e);
        process.exit(1);
    }
}

export class BotConfig {
    private activity: string;
    private activityType: ActivityType;
    private currencyName: string;
    private currencySymbol: string;
    private dailyEnabled: boolean;
    private dailyAmount: number;

    constructor(array: [any, FieldPacket[]]) {
        const data = array[0][0];
        this.activity = data.Activity;
        this.activityType = data.ActivityType;
        this.currencyName = data.CurrencyName;
        this.currencySymbol = data.CurrencySymbol;
        this.dailyEnabled = Boolean(data.DailyEnabled);
        this.dailyAmount = parseInt(data.DailyAmount);
    }
}
