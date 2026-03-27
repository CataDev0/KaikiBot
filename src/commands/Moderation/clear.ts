import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "clear",
    aliases: ["prune"],
    description: "Clears up to 100 messages in the current channel. Minimum 2.",
    usage: ["69"],
    requiredUserPermissions: ["ManageMessages"],
    requiredClientPermissions: ["ManageMessages"],
    preconditions: ["GuildOnly"],
    cooldownDelay: 60000,
    typing: true,
})
export default class ClearCommand extends KaikiCommand {
    private static maxAgeMs = 14 * 24 * 60 * 60 * 1000;

    public async messageRun(message: Message<true>, args: Args) {
        const int = await args.rest("number", { maximum: 100, minimum: 2 });

        const channels = await message.channel.messages.fetch({ limit: int });
        const dateNow = Date.now();

        // Filter all messages that are newer than 14 days old
        const bulkDeletable = channels.filter(
            (c) => dateNow - c.createdAt.getTime() < ClearCommand.maxAgeMs
        );

        const manualDelete = channels.filter(
            (c) => dateNow - c.createdAt.getTime() > ClearCommand.maxAgeMs
        );

        if (bulkDeletable.size) {
            await message.channel.bulkDelete(bulkDeletable);
        }

        await message.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Deleting **${int}** messages...!`)
                        .withOkColor(message),
                ],
            })
            .then((m) =>
                setTimeout(
                    () => m.delete().catch(() => null),
                    manualDelete.size *
						Constants.MAGIC_NUMBERS.CMDS.MODERATION.CLEAR
						    .DELETE_TIMEOUT
                )
            );

        let i = 0;
        manualDelete.each((m) => {
            i += Constants.MAGIC_NUMBERS.CMDS.MODERATION.CLEAR.DELETE_TIMEOUT;
            setTimeout(() => m.delete().catch(() => null), i);
        });
    }
}
