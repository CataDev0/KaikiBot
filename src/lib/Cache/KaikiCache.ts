import pkg from "@prisma/client";
import { Message } from "discord.js";
import Constants from "../../struct/Constants";
import {
    EmoteTrigger,
    GuildString,
    TriggerObject,
} from "../Interfaces/Kaiki/KaikiCache";

export enum ERCacheType {
	HAS_SPACE,
	NO_SPACE,
}

export default class KaikiCache {
    public cmdStatsCache = new Map<string, number>();
    public emoteReactCache = new Map<GuildString, Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>>();
    public dailyProvider: DailyProvider;

    /**
     * Shared structure for guilds without any emote-react triggers.
     * Never mutate it - use {@link ensureGuildCache} before writing.
     */
    public static readonly EMPTY_GUILD_CACHE = KaikiCache.createEmptyGuildCache();

    constructor(
        orm: pkg.PrismaClient
    ) {
        this.dailyProvider = new DailyProvider(orm);

        void this.init(orm);
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
            this.cmdStatsCache.set(command, ++number);
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

        // Store the shared empty structure for guilds without triggers
        // instead of one empty map per guild (has() must stay true to
        // avoid a DB query on every message).
        if (!emoteReacts.length) {
            emoteReactCache.set(guildId, KaikiCache.EMPTY_GUILD_CACHE);
            return;
        }

        // Initialize an empty guild cache structure
        const guildCache = KaikiCache.createEmptyGuildCache();

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

        // Store the prepared cache for this guild
        emoteReactCache.set(guildId, guildCache);
    }

    private static createEmptyGuildCache(): Map<ERCacheType, Map<EmoteTrigger, TriggerObject>> {
        return new Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>([
            [ERCacheType.HAS_SPACE, new Map()],
            [ERCacheType.NO_SPACE, new Map()],
        ]);
    }

    // Returns a mutable per-guild cache, replacing the shared empty sentinel if needed.
    public static ensureGuildCache(message: Message<true>): Map<ERCacheType, Map<EmoteTrigger, TriggerObject>> {
        const { client, guildId } = message;
        const existing = client.cache.emoteReactCache.get(guildId);

        if (existing && existing !== KaikiCache.EMPTY_GUILD_CACHE) return existing;

        const fresh = KaikiCache.createEmptyGuildCache();
        client.cache.emoteReactCache.set(guildId, fresh);
        return fresh;
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
            if (!triggerObject) continue;

            const isCustomEmoji = /^\d+$/.test(triggerObject.id);
            if (isCustomEmoji && !message.guild?.emojis.cache.has(triggerObject.id)) continue;

            const emoteId = triggerObject.id;

            // Avoids retraction of existing reactions
            if (message.reactions.cache.has(emoteId)) {
                continue;
            }

            await message.react(emoteId).catch(() => null);
        }
    }
}

class DailyProvider {
    private orm: pkg.PrismaClient;

    constructor(orm: pkg.PrismaClient) {
        this.orm = orm;
    }

    async hasClaimedDaily(id: string) {
        const rows = await this.orm.$queryRawUnsafe<any[]>(
            "SELECT ClaimedDaily FROM DiscordUsers WHERE UserId = ?",
            BigInt(id)
        );
        return rows[0]?.ClaimedDaily ?? true;
    }

    // Sets claimed status to true
    async setClaimed(id: string) {
        return this.orm
            .$executeRawUnsafe(
                "UPDATE DiscordUsers SET ClaimedDaily = ? WHERE UserId = ?",
                true, BigInt(id)
            )
            .then((affectedRows) =>
                affectedRows ? affectedRows > 0 : false
            )
            .catch(() => false);
    }
}
