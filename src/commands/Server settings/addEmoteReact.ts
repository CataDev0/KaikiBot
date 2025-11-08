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

        if (!emoji.id) throw EmoteReactCommand.emojiUserError;

        const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`;
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
                    EmojiId: BigInt(emoji.id),
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
                    EmojiId: BigInt(emoji.id),
                    TriggerString: trigger,
                },
            });
        }

        if (!this.client.cache.emoteReactCache.get(message.guildId))
            await KaikiCache.populateERCache(message);

        if (trigger.includes(" ")) {
            this.client.cache.emoteReactCache
                .get(message.guildId)
                ?.get(ERCacheType.HAS_SPACE)
                ?.set(trigger, { id: emoji.id });
        } else {
            this.client.cache.emoteReactCache
                .get(message.guildId)
                ?.get(ERCacheType.NO_SPACE)
                ?.set(trigger, { id: emoji.id });
        }

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("New emoji trigger added")
                    .setDescription(
                        `Typing \`${trigger}\` will force me to react with :${emoji.name}:...`
                    )
                    .setThumbnail(emojiUrl)
                    .withOkColor(message),
            ],
        });
    }
}
