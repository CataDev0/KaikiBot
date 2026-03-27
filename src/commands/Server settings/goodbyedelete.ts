import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "goodbyedelete",
    aliases: ["goodbyedel", "byedel"],
    description:
		"Set the time, in seconds, it takes for goodbye messages to be deleted by the bot. Set to 0 to disable.",
    usage: ["10"],
    requiredUserPermissions: ["ManageGuild"],
    preconditions: ["GuildOnly"],
    minorCategory: "Goodbye",
})
export default class GoodbyeDeleteCommand extends KaikiCommand {
    public async messageRun(
        message: Message<true>,
        args: Args
    ): Promise<Message> {
        const time = await args.rest("number", { maximum: 86400, minimum: 0 }).catch(() => null);

        await this.client.orm.guilds.update({
            where: {
                Id: BigInt(message.guildId),
            },
            data: {
                ByeTimeout: time,
            },
        });

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        time
                            ? `Goodbye messages will be deleted after ${time} seconds.`
                            : "Goodbye message will not be deleted."
                    )
                    .withOkColor(message),
            ],
        });
    }
}
