import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { ERCacheType } from "../../lib/Cache/KaikiCache";

@ApplyOptions<KaikiCommandOptions>({
    name: "removereact",
    aliases: ["rer"],
    description: "Remove emotereact triggers.",
    usage: ["anime"],
    requiredUserPermissions: ["ManageEmojisAndStickers"],
    preconditions: ["GuildOnly"],
})
export default class RemoveEmoteReactCommand extends KaikiCommand {
    public async messageRun(
        message: Message<true>,
        args: Args
    ): Promise<Message> {
        const trigger = await args.rest("string");

        const db = await this.client.orm.emojiReactions.findFirst({
            where: {
                GuildId: BigInt(message.guildId),
                // TODO: Check if this needs lowercase/string formatting
                TriggerString: trigger,
            },
            select: {
                Id: true,
                EmojiId: true,
            },
        });

        const emoji = message.guild?.emojis.cache.get(String(db?.EmojiId));

        if (db) {
            await this.client.orm.emojiReactions.delete({
                where: {
                    Id: db.Id,
                },
            });

            if (trigger.includes(" ")) {
                this.client.cache.emoteReactCache
                    .get(message.guildId)
                    ?.get(ERCacheType.HAS_SPACE)
                    ?.delete(trigger);
            } else {
                this.client.cache.emoteReactCache
                    .get(message.guildId)
                    ?.get(ERCacheType.NO_SPACE)
                    ?.delete(trigger);
            }

            const embed = new EmbedBuilder()
                .setTitle("Removed emoji trigger")
                .setDescription(
                    `Saying \`${trigger}\` will no longer force me to react with \`${emoji?.name ?? "missing emote"}\``
                )
                .withOkColor(message);

            if (emoji) embed.setThumbnail(emoji.url);

            return message.reply({ embeds: [embed] });
        } else {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Not found")
                        .setDescription("Trigger not found in the database")
                        .withErrorColor(message),
                ],
            });
        }
    }
}
