import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiCache, { ERCacheType } from "../../lib/Cache/KaikiCache";

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
        const trigger = (await args.rest("string")).toLowerCase();

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

        const emoji = db?.EmojiId ? message.guild?.emojis.cache.get(db.EmojiId) : undefined;

        if (db) {
            await this.client.orm.emojiReactions.delete({
                where: {
                    Id: db.Id,
                },
            });

            const guildCache = this.client.cache.emoteReactCache.get(message.guildId);

            if (trigger.includes(" ")) {
                guildCache?.get(ERCacheType.HAS_SPACE)?.delete(trigger);
            } else {
                guildCache?.get(ERCacheType.NO_SPACE)?.delete(trigger);
            }

            // Fall back to the shared empty structure once no triggers remain
            if (
                guildCache &&
                !guildCache.get(ERCacheType.HAS_SPACE)?.size &&
                !guildCache.get(ERCacheType.NO_SPACE)?.size
            ) {
                this.client.cache.emoteReactCache.set(
                    message.guildId,
                    KaikiCache.EMPTY_GUILD_CACHE
                );
            }

            const embed = new EmbedBuilder()
                .setTitle("Removed emoji trigger")
                .setDescription(
                    `Saying \`${trigger}\` will no longer force me to react with \`${emoji?.name ?? db?.EmojiId ?? "missing emote"}\``
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
