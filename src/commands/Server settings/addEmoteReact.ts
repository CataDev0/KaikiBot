import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCache, { ERCacheType } from "../../lib/Cache/KaikiCache";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "addemotereact",
    aliases: ["emotereact", "aer"],
    description:
		"Add triggers for the bot to react with emojis/emotes to. Use quotes for triggers with spaces.",
    usage: ["red :red:", "anime :weeaboosgetout:"],
    requiredUserPermissions: ["ManageEmojisAndStickers"],
    requiredClientPermissions: ["AddReactions"],
    preconditions: ["GuildOnly"],
})
export default class EmoteReactCommand extends KaikiCommand {

    static emojiUserError = new UserError({
        identifier: "NoEmojiProvided",
        message: "Couldn't find an emoji with that name.",
    });

    public async messageRun(
        message: Message<true>,
        args: Args
    ): Promise<Message> {
        const trigger = (await args.pick("string")).toLowerCase();
        const emoji = await args.pick("emoji")
            .catch(() => {
                throw EmoteReactCommand.emojiUserError;
            });

        const emojiIdOrName = emoji.id || emoji.name;
        if (!emojiIdOrName) throw EmoteReactCommand.emojiUserError;

        const emojiUrl = emoji.id
            ? `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`
            : null;
        const possibleTrigger = await this.client.orm.emojiReactions.findFirst({
            where: {
                GuildId: BigInt(message.guildId),
                TriggerString: trigger,
            },
        });

        if (possibleTrigger) {
            await this.client.orm.emojiReactions.update({
                where: {
                    Id: possibleTrigger.Id,
                },
                data: {
                    EmojiId: emojiIdOrName,
                    TriggerString: trigger,
                },
            });
        } else {
            await this.client.orm.emojiReactions.create({
                data: {
                    Guilds: {
                        connect: {
                            Id: BigInt(message.guildId),
                        },
                    },
                    EmojiId: emojiIdOrName,
                    TriggerString: trigger,
                },
            });
        }

        // Re-populate when the guild has no cache entry or only the shared empty sentinel
        // The insert above is included by the populate query.
        const cached = this.client.cache.emoteReactCache.get(message.guildId);
        if (!cached || cached === KaikiCache.EMPTY_GUILD_CACHE) {
            await KaikiCache.populateERCache(message);
        }

        const guildCache = KaikiCache.ensureGuildCache(message);

        if (trigger.includes(" ")) {
            guildCache.get(ERCacheType.HAS_SPACE)?.set(trigger, { id: emojiIdOrName });
        } else {
            guildCache.get(ERCacheType.NO_SPACE)?.set(trigger, { id: emojiIdOrName });
        }

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("New emoji trigger added")
                    .setDescription(
                        `Typing \`${trigger}\` will force me to react with :${emoji.name}:...`
                    )
                    .setThumbnail(emojiUrl ?? null)
                    .withOkColor(message),
            ],
        });
    }
}
