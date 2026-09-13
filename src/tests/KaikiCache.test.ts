import { describe, expect, it, jest } from "@jest/globals";
import { Message } from "discord.js";
import KaikiCache, { ERCacheType } from "../lib/Cache/KaikiCache";

function mockMessage(rows: { TriggerString: string; EmojiId: string }[]) {
    return {
        guildId: "123",
        client: {
            orm: {
                emojiReactions: {
                    findMany: jest.fn(async () => rows),
                },
            },
            cache: {
                emoteReactCache: new Map(),
            },
        },
    } as unknown as Message<true>;
}

describe("KaikiCache", () => {
    describe("populateERCache", () => {
        it("stores the shared empty sentinel when a guild has no triggers", async () => {
            const message = mockMessage([]);

            await KaikiCache.populateERCache(message);

            expect(
                message.client.cache.emoteReactCache.get("123")
            ).toBe(KaikiCache.EMPTY_GUILD_CACHE);
        });

        it("stores a populated cache for guilds with triggers", async () => {
            const message = mockMessage([
                { TriggerString: "anime", EmojiId: "1" },
                { TriggerString: "hello world", EmojiId: "2" },
            ]);

            await KaikiCache.populateERCache(message);

            const guildCache = message.client.cache.emoteReactCache.get("123");

            expect(guildCache).not.toBe(KaikiCache.EMPTY_GUILD_CACHE);
            expect(guildCache?.get(ERCacheType.NO_SPACE)?.get("anime")).toEqual({
                id: "1",
            });
            expect(
                guildCache?.get(ERCacheType.HAS_SPACE)?.get("hello world")
            ).toMatchObject({ id: "2" });
        });
    });

    describe("ensureGuildCache", () => {
        it("replaces the shared sentinel with a fresh mutable cache", () => {
            const message = mockMessage([]);
            message.client.cache.emoteReactCache.set(
                "123",
                KaikiCache.EMPTY_GUILD_CACHE
            );

            const guildCache = KaikiCache.ensureGuildCache(message);

            expect(guildCache).not.toBe(KaikiCache.EMPTY_GUILD_CACHE);
            expect(
                message.client.cache.emoteReactCache.get("123")
            ).toBe(guildCache);

            // The shared sentinel must remain untouched
            expect(
                KaikiCache.EMPTY_GUILD_CACHE.get(ERCacheType.NO_SPACE)?.size
            ).toBe(0);
        });

        it("returns the existing per-guild cache when present", () => {
            const message = mockMessage([]);
            const existing = KaikiCache.ensureGuildCache(message);

            expect(KaikiCache.ensureGuildCache(message)).toBe(existing);
        });
    });
});
