import process from "process";
import { QualifiedService } from "../../services/Service";

export default class Database extends QualifiedService {

    public async init(): Promise<Database> {
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
            this.client.guildsDb.items.set(String(newGuild.Id), newGuild);
            return newGuild;
        }

        // Re-sync the in-memory row in case it was evicted on guildDelete
        this.client.guildsDb.items.set(String(guild.Id), guild);
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
            await this.init();
        }

        catch (e) {
            this.client.logger.fatal("Database initialization failed - Make sure the database is running and reachable", e);
            process.exit(1);
        }

        this.client.botSettings
            .init()
            .catch((e) => this.dbRejected(e));

        this.client.guildsDb
            .init()
            .catch((e) => this.dbRejected(e));

        this.client.dadBotChannels
            .init()
            .catch((e) => this.dbRejected(e));
    }

    private dbRejected(e: unknown) {
        this.client.logger.fatal("Failed to connect to database using Prisma.", e);
        process.exit(1);
    }
}
