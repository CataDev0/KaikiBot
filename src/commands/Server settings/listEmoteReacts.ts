import { ApplyOptions } from "@sapphire/decorators";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "listreacts",
    aliases: ["ler"],
    description: "List emotereact triggers.",
    usage: [""],
    preconditions: ["GuildOnly"],
})
export default class ListEmoteReactCommand extends KaikiCommand {
    public async messageRun(message: Message<true>) {
        const db = await this.client.orm.emojiReactions.findMany({
            where: { GuildId: BigInt(message.guildId) },
        });

        const pages: EmbedBuilder[] = [];

        if (db.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("No triggers")
                        .setDescription(
                            `Add triggers with ${await message.client.fetchPrefix(message)}aer`
                        )
                        .withErrorColor(message),
                ],
            });
        }

        for (
            let index =
					Constants.MAGIC_NUMBERS.CMDS.SERVER_SETTINGS.EMOTES
					    .EMOTE_TRIGGERS_PR_PAGE,
                p = 0;
            p < db.length;
            index +=
				Constants.MAGIC_NUMBERS.CMDS.SERVER_SETTINGS.EMOTES
				    .EMOTE_TRIGGERS_PR_PAGE,
            p +=
					Constants.MAGIC_NUMBERS.CMDS.SERVER_SETTINGS.EMOTES
					    .EMOTE_TRIGGERS_PR_PAGE
        ) {
            pages.push(
                new EmbedBuilder()
                    .setTitle("Emoji triggers")
                    .setDescription(
                        db
                            .slice(p, index)
                            .map((table) => {
                                return `**${table.TriggerString}** => ${message.guild?.emojis.cache.get(table.EmojiId) ?? table.EmojiId}`;
                            })
                            .join("\n")
                    )
                    .withOkColor(message)
            );
        }

        return sendPaginatedMessage(message, pages, { owner: message.author });
    }
}
