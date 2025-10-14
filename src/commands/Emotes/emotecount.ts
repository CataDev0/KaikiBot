import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { EmbedBuilder, GuildEmoji, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

// Emote data from database and djs
type EmoteStats = {
    EmojiId: bigint;
    Count: bigint;
    GuildId: bigint;
};
type ExtendedGuildEmoji = GuildEmoji & {
    Count: bigint;
    EmojiId?: bigint;
    GuildId?: bigint;
};
@ApplyOptions<KaikiCommandOptions>({
    name: "emotecount",
    aliases: ["emojicount", "ec"],
    description:
		"Shows amount of times each emote has been used.\nUse --small for a more compact display.\nUse --clean to display *only* available emotes.",
    usage: ["", "--small", "--clean"],
    preconditions: ["GuildOnly"],
    flags: ["small", "clean"],
    cooldownDelay: 15000,
})
export default class EmoteCount extends KaikiCommand {
    private hasName(
        guildEmoji: ExtendedGuildEmoji | { Count: bigint }
    ): guildEmoji is ExtendedGuildEmoji {
        return "name" in guildEmoji;
    }

    private createSmolString(guildEmoji: ExtendedGuildEmoji, available = false) {
        return `${!this.hasName(guildEmoji) && !available ? "N/A": guildEmoji} \`${guildEmoji.Count || 0}\``;
    }

    private createNormalString(guildEmoji: ExtendedGuildEmoji, available = false) {
        return `${!this.hasName(guildEmoji) && !available ? "N/A": guildEmoji} | \`${guildEmoji.Count || 0}\` | \`${this.hasName(guildEmoji) && available ? guildEmoji.name : "N/A"}\``;
    }

    public async messageRun(
        message: Message<true>,
        args: Args
    ): Promise<Message | void> {
        if (!message.guild.emojis.cache.size) {
            throw new UserError({
                identifier: "NoGuildEmojis",
                message: "There are no emojis in this server.",
            });
        }

        const isSmall = args.getFlags("small");
        const isClean = args.getFlags("clean");

        let guildDB = await this.client.orm.guilds.findUnique({
            where: {
                Id: BigInt(message.guildId),
            },
            select: {
                EmojiStats: true,
            },
        });

        if (!guildDB) {
            await this.client.db.getOrCreateGuild(BigInt(message.guildId));
            guildDB = { EmojiStats: [] };
        }

        const baseEmbed = new EmbedBuilder()
            .setTitle("Emote count")
            .setAuthor({ name: message.guild.name })
            .withOkColor(message);

        const mappedEmotes = message.guild.emojis.cache.map((emoji) => {
            const dbStat = guildDB?.EmojiStats.find(
                (e) => String(e.EmojiId) === emoji.id
            );
            return Object.assign(emoji, {
                Count: dbStat ? dbStat.Count : 0n,
                EmojiId: dbStat?.EmojiId,
                GuildId: dbStat?.GuildId,
            }) as ExtendedGuildEmoji;
        });

        // Filter out unavailable emojis if --clean is set
        const filteredEmotes = isClean
            ? mappedEmotes.filter((emoji) => emoji.available)
            : mappedEmotes;

        // Sort by usage count descending
        filteredEmotes.sort((a, b) => Number(b.Count) - Number(a.Count));

        // Throw error if no emojis left after filter (rare case)
        if (!filteredEmotes.length) {
            throw new UserError({
                identifier: "NoAvailableEmotes",
                message: "There are no available emotes in this server!",
            });
        }

        // Format emoji strings
        const displayData = filteredEmotes.map((emoji) => {
            const unavailable = !emoji.available;
            return isSmall
                ? this.createSmolString(emoji, unavailable)
                : this.createNormalString(emoji, unavailable);
        });

        // Paginate results
        const pages: EmbedBuilder[] = [];
        const chunkSize = isSmall
            ? Constants.MAGIC_NUMBERS.CMDS.EMOTES.EMOTE_COUNT.MAX_PR_PAGE
            : Constants.MAGIC_NUMBERS.CMDS.EMOTES.EMOTE_COUNT.MIN_PR_PAGE;
        const separator = isSmall ? "" : "\n";

        for (let p = 0; p < displayData.length; p += chunkSize) {
            pages.push(
                EmbedBuilder.from(baseEmbed).setDescription(
                    KaikiUtil.trim(
                        displayData.slice(p, p + chunkSize).join(separator),
                        Constants.MAGIC_NUMBERS.EMBED_LIMITS.DESCRIPTION
                    )
                )
            );
        }

        return sendPaginatedMessage(message, pages, {});
    }
}
