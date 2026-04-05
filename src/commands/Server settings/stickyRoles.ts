import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "stickyroles",
    aliases: ["sticky"],
    usage: "",
    description:
		"Toggles whether bot will give all roles back when someone re-joins the server",
    requiredUserPermissions: ["Administrator"],
    preconditions: ["GuildOnly"],
})
export default class ToggleStickyRolesCommand extends KaikiCommand {
    public async messageRun(message: Message<true>): Promise<Message> {
        const db = await this.client.db.getOrCreateGuild(
            BigInt(message.guildId)
        );

        const newValue = !db.StickyRoles;

        await this.client.guildsDb.set(
            message.guild.id,
            "StickyRoles",
            newValue
        );

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Sticky roles have been ${KaikiUtil.toggledTernary(newValue)}.`
                    )
                    .withOkColor(message),
            ],
        });
    }
}
