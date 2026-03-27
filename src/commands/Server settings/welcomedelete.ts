import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "welcomedelete",
    aliases: ["welcomedel"],
    description:
		"Set the time it takes for welcome messages to be deleted by the bot",
    usage: ["10"],
    requiredUserPermissions: ["ManageGuild"],
    preconditions: ["GuildOnly"],
    minorCategory: "Welcome",
})
export default class WelcomeDeleteCommand extends KaikiCommand {
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
                WelcomeTimeout: time,
            },
        });

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Welcome messages will be deleted after ${time} seconds.`
                    )
                    .withOkColor(message),
            ],
        });
    }
}
