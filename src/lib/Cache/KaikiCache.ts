import pkg from "@prisma/client";
import { Message, Snowflake } from "discord.js";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { APIs, ClientImageAPIs } from "../APIs/Common/Types";
import KaikiUtil from "../KaikiUtil";
import Constants from "../../struct/Constants";
import {
    EmoteTrigger,
    GuildString,
    PartitionResult,
    TriggerObject,
} from "../Interfaces/Kaiki/KaikiCache";

export enum ERCacheType {
	HAS_SPACE,
	NO_SPACE,
}

export default class KaikiCache {
    public cmdStatsCache = new Map<string, number>();
    public emoteReactCache = new Map<GuildString, Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>>();
    public dailyProvider: MySQLDailyProvider;
    public imageAPICache = new Map<APIs, Map<string, Record<string, unknown>>>();
    private imageAPIs: ClientImageAPIs;

    constructor(
        orm: pkg.PrismaClient,
        connection: Pool,
        imageAPIs: ClientImageAPIs
    ) {
        this.dailyProvider = new MySQLDailyProvider(connection);
        this.imageAPIs = imageAPIs;

        void this.init(orm);
        this.populateImageAPICache();
    }

    // Creates a loop of 15 minutes to synchronize the command stats cache to the DB.
    public async init(orm: pkg.PrismaClient) {
        return setInterval(async () => {
            void this.syncCommandStats(orm);
        }, Constants.MAGIC_NUMBERS.CACHE.FIFTEEN_MINUTES_MS);
    }

    public incrementCommand(command: string) {
        let number = this.cmdStatsCache.get(command);

        if (number !== undefined) {
            this.cmdStatsCache.set(command, number++);
        } else {
            this.cmdStatsCache.set(command, 1);
        }
    }

    private async syncCommandStats(orm: pkg.PrismaClient) {
        if (!this.cmdStatsCache.size) return;

        const requests = Array(...this.cmdStatsCache.entries()).map(
            ([command, amount]) =>
                orm.commandStats.upsert({
                    where: {
                        CommandAlias: command,
                    },
                    create: {
                        CommandAlias: command,
                        Count: amount,
                    },
                    update: {
                        Count: {
                            increment: amount,
                        },
                    },
                })
        );
        await orm.$transaction(requests);
        this.cmdStatsCache = new Map();
    }

    public static async populateERCache(message: Message<true>) {
        const { client, guildId } = message;

        // Fetch all emote reaction triggers for this guild
        const emoteReacts = await client.orm.emojiReactions.findMany({
            where: { GuildId: BigInt(guildId) },
            select: { TriggerString: true, EmojiId: true },
        });
      
        const { emoteReactCache } = client.cache;

        // Initialize an empty guild cache structure
        const guildCache = new Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>([
            [ERCacheType.HAS_SPACE, new Map()],
            [ERCacheType.NO_SPACE, new Map()],
        ]);

        // Only process if we have data
        if (emoteReacts.length) {
            // Normalize and partition triggers once
            for (const { TriggerString, EmojiId } of emoteReacts) {
                if (!TriggerString || !EmojiId) continue;

                const key = TriggerString.toLowerCase().trim();
                const value = String(EmojiId);

                // Precompile regex only for triggers that contain spaces
                if (key.includes(" ")) {
                    // Escape regex special characters to avoid accidental patterns
                    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                    const regex = new RegExp(`\\b${escaped}\\b`, "gi");
                    guildCache.get(ERCacheType.HAS_SPACE)?.set(key, { id: value, regex });
                } else {
                    guildCache.get(ERCacheType.NO_SPACE)?.set(key, { id: value });
                }
            }
        }

        // Store the prepared cache for this guild
        emoteReactCache.set(guildId, guildCache);
    }

    // Reacts with emote to words in Emote React cache.
    public async emoteReact(message: Message<true>): Promise<void> {
        const { client, guildId } = message;
        const messageContent = message.content.toLowerCase();

        // Retrieve or lazily initialize cache for this guild
        let guildCache = client.cache.emoteReactCache.get(guildId);
        if (!guildCache) {
            await KaikiCache.populateERCache(message);
            guildCache = client.cache.emoteReactCache.get(guildId);
        }

        if (!guildCache) return;

        const hasSpace = guildCache.get(ERCacheType.HAS_SPACE);
        const noSpace = guildCache.get(ERCacheType.NO_SPACE);
        const matches: string[] = [];

        // First, find matches with spaces
        if (hasSpace?.size) {
            for (const [key, { regex }] of hasSpace) {
                if (!regex) continue;
                // Use test() instead of match() for efficiency
                if (regex.test(messageContent)) {
                    matches.push(key);
                }
            }
        }

        // Then push matches that have no spaces
        if (noSpace?.size) {
            // Using split to handle punctuation, tabs, etc.
            const words = messageContent.match(/\b\w+\b/g) ?? [];
            for (const word of words) {
                if (noSpace.has(word)) {
                    matches.push(word);
                }
            }
        }

        if (!matches.length) return;

        return KaikiCache.emoteReactLoop(message, matches, guildCache);
    }

    public static async emoteReactLoop(
        message: Message,
        matches: string[],
        wordObj: Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>
    ) {
        for (const word of matches) {
            const triggerObject =
				wordObj.get(ERCacheType.NO_SPACE)?.get(word) ||
				wordObj.get(ERCacheType.HAS_SPACE)?.get(word);

            // Skip unresolved emotes
            if (!triggerObject || !message.guild?.emojis.cache.has(triggerObject.id))
                continue;

            const emoteId = triggerObject.id;

            // Avoids retraction of existing reactions
            if (message.reactions.cache.has(emoteId)) {
                continue;
            }

            await message.react(emoteId);
        }
    }

    private populateImageAPICache() {
        Object.keys(this.imageAPIs).forEach((api: APIs) => {
            this.imageAPICache.set(
                api,
                new Map<string, Record<string, unknown>>()
            );
        });
    }}

class MySQLDailyProvider {
    private connection: Pool;

    constructor(connection: Pool) {
        this.connection = connection;
    }

    async hasClaimedDaily(id: string) {
        const [rows] = await this.connection.query<RowDataPacket[]>(
            "SELECT ClaimedDaily FROM DiscordUsers WHERE UserId = ?",
            [BigInt(id)]
        );
        return rows[0]?.ClaimedDaily ?? true;
    }

    // Sets claimed status to true
    async setClaimed(id: string) {
        return this.connection
            .query<ResultSetHeader>(
                "UPDATE DiscordUsers SET ClaimedDaily = ? WHERE UserId = ?",
                [true, BigInt(id)]
            )
            .then(([result]) =>
                result.affectedRows ? result.affectedRows > 0 : false
            )
            .catch(() => false);
    }
}
