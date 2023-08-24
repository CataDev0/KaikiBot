import pkg from "@prisma/client";
import { Collection, Message, Snowflake } from "discord.js";
import { Pool, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { APIs, ClientImageAPIs } from "../lib/APIs/Common/Types";
import KaikiUtil from "../lib/KaikiUtil";
import { RespType } from "../lib/Types/Miscellaneous";
import Constants from "../struct/Constants";

export type EmoteTrigger = string;
export type GuildString = Snowflake;
export type TriggerString = string;
export type EmoteReactCache = Map<GuildString, Map<ERCacheType, Map<EmoteTrigger, TriggerString>>>;

type PartitionResult = [[string, bigint][], [string, bigint][]];

export enum ERCacheType {
    HAS_SPACE,
    NO_SPACE
}

export default class KaikiCache {

    public animeQuoteCache: Collection<string, RespType>;
    public cmdStatsCache: Map<string, number>;
    public emoteReactCache: EmoteReactCache;
    public dailyProvider: MySQLDailyProvider;
    public imageAPICache: Map<APIs, Map<string, Record<string, unknown>>>;
    private imageAPIs: ClientImageAPIs;

    constructor(orm: pkg.PrismaClient, connection: Pool, imageAPIs: ClientImageAPIs) {
        this.animeQuoteCache = new Collection<string, RespType>();
        this.cmdStatsCache = new Map<string, number>();
        this.dailyProvider = new MySQLDailyProvider(connection);
        this.emoteReactCache = new Map<GuildString, Map<ERCacheType, Map<EmoteTrigger, TriggerString>>>();

        // API cache
        this.imageAPIs = imageAPIs;
        this.imageAPICache = new Map<APIs, Map<string, Record<string, unknown>>>;

        void this.init(orm);
        this.populateImageAPICache();
    }

    public async init(orm: pkg.PrismaClient) {

        return setInterval(async () => {
            if (this.cmdStatsCache.size) {
                const requests = Array(...this.cmdStatsCache.entries())
                    .map(([command, amount]) => orm.commandStats
                        .upsert({
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
                        }));
                await orm.$transaction(requests);
                this.cmdStatsCache = new Map();
            }
        }, Constants.MAGIC_NUMBERS.CACHE.FIFTEEN_MINUTES_MS);
    }

    public static async populateERCache(message: Message<true>) {

        const emoteReacts = (await message.client.orm.emojiReactions.findMany({ where: { GuildId: BigInt(message.guildId) } }))
            .map(table => [table.TriggerString, table.EmojiId]);

        message.client.cache.emoteReactCache.set(message.guildId, new Map([[ERCacheType.HAS_SPACE, new Map()], [ERCacheType.NO_SPACE, new Map()]]));

        if (emoteReacts.length) {
            const [space, noSpace]: PartitionResult = KaikiUtil.partition(emoteReacts, ([k]: string[]) => k.includes(" "));

            for (const [key, value] of space) {
                message.client.cache.emoteReactCache.get(message.guildId)?.get(ERCacheType.HAS_SPACE)?.set(key, String(value));
            }
            for (const [key, value] of noSpace) {
                message.client.cache.emoteReactCache.get(message.guildId)?.get(ERCacheType.NO_SPACE)?.set(key, String(value));
            }
        }
    }

    // Reacts with emote to specified words
    public async emoteReact(message: Message<true>): Promise<void> {

        const id = message.guildId,
            messageContent = message.content.toLowerCase();

        if (!message.client.cache.emoteReactCache.get(id)) {
            await KaikiCache.populateERCache(message);
        }

        const emotes = message.client.cache.emoteReactCache.get(id);

        if (!emotes) return;

        const iterables = emotes?.get(ERCacheType.HAS_SPACE)?.keys();

        if (!iterables) return;

        const properMatches = Array.from(iterables).filter(k => {
            if (!k) return false;
            messageContent.match(new RegExp(k.toLowerCase(), "g"));
        });

        for (const word of messageContent.split(" ")) {
            if (emotes?.get(ERCacheType.NO_SPACE)?.has(word)) {
                properMatches.push(word);
            }
        }

        if (!properMatches.length) return;

        return KaikiCache.emoteReactLoop(message, properMatches, emotes);
    }

    public static async emoteReactLoop(message: Message, matches: string[], wordObj: Map<ERCacheType, Map<EmoteTrigger, TriggerString>>) {
        for (const word of matches) {
            const emote = wordObj.get(ERCacheType.NO_SPACE)?.get(word) || wordObj.get(ERCacheType.HAS_SPACE)?.get(word);
            if (!message.guild?.emojis.cache.has(emote as Snowflake) || !emote) continue;
            await message.react(emote);
        }
    }

    private populateImageAPICache() {
        Object.keys(this.imageAPIs).forEach((api: APIs) => {
            this.imageAPICache.set(api, new Map<string, Record<string, unknown>>);
        });
    }
}

class MySQLDailyProvider {
    private connection: Pool;

    constructor(connection: Pool) {
        this.connection = connection;
    }

    async hasClaimedDaily(id: string) {
        const [rows] = await this.connection.query<RowDataPacket[]>("SELECT ClaimedDaily FROM DiscordUsers WHERE UserId = ?", [BigInt(id)]);
        return rows[0]?.ClaimedDaily ?? true;
    }

    // Sets claimed status to true
    async setClaimed(id: string) {
        return this.connection.query<ResultSetHeader>("UPDATE DiscordUsers SET ClaimedDaily = ? WHERE UserId = ?", [true, BigInt(id)])
            .then(([result]) => result.affectedRows
                ? result.affectedRows > 0
                : false)
            .catch(() => false);
    }
}

