import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, formatEmoji, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

@ApplyOptions<KaikiCommandOptions>({
    name: "deleteemote",
    aliases: ["de"],
    description:
        "Deletes one or multiple emotes/emoji. Multiple emotes take longer, to avoid ratelimits. Keep a space between all emotes you wish to delete.",
    usage: ":NadekoSip:",
    requiredUserPermissions: ["ManageEmojisAndStickers"],
    requiredClientPermissions: ["ManageEmojisAndStickers"],
    preconditions: ["GuildOnly"],
    typing: true,
})
export default class DeleteEmoteCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const emotes = await args.repeat("emoji");

        if (emotes.length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        title: "Error occurred",
                        description: "No valid emotes provided.",
                    }).withErrorColor(message),
                ],
            });
        }

        const completed: string[] = [];
        const failed: string[] = [];
        let i = 0;

        const tempMsg = await message.reply({ content: "Deleting emotes..." });

        for (const emote of emotes) {
            if (!this.isEmote(emote)) {
                // Skip invalid emotes if they even exist
                continue;
            }

            // Resolve emoji
            const emoji = message.guild?.emojis.cache.get(emote.id);
            if (!emoji) {
                failed.push(`${formatEmoji(emote.id, emote.animated)} [${emote.id}]`);
                continue;
            }

            // Ratelimit
            if (i > 0) {
                await timer(Constants.MAGIC_NUMBERS.CMDS.EMOTES.DELETE_EMOTE.DELETE_DELAY);
            }

            try {
                const deleted = await emoji.delete();
                completed.push(`[${deleted.id}]`);
            }
            catch {
                failed.push(`${formatEmoji(emote.id, emote.animated)} [${emote.id}]`);
            }
            i++;
        }

        let embed = new EmbedBuilder()
            .setTitle(completed.length > 0 ? "Success!" : "Error occurred");

        if (completed.length > 0) {
            embed.setDescription(`Deleted:\n${KaikiUtil.trim(completed.join("\n"), Constants.MAGIC_NUMBERS.EMBED_LIMITS.DESCRIPTION)}\n`);
        }
        if (failed.length > 0) {
            embed.setDescription(embed.data.description || "" + `Failed to delete:\n${KaikiUtil.trim(failed.join("\n"), Constants.MAGIC_NUMBERS.EMBED_LIMITS.DESCRIPTION)}`);
        }

        return tempMsg.edit({
            embeds: [
                embed[failed.length > 0 ? "withErrorColor" : "withOkColor"](message)
            ],
        });
    }

    private isEmote(emojiObject: any): emojiObject is APIEmoji {
        return !!emojiObject.id && !!emojiObject.name;
    }
}

type APIEmoji = {
    name: string,
    id: string,
    animated?: boolean
}