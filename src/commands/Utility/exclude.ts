import { AkairoMessage } from "discord-akairo";
import { EmbedBuilder, Message, PermissionsBitField } from "discord.js";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { dadbotCheck, excludeCommand } from "../../lib/SlashCommands/functions";

export default class ExcludeCommand extends KaikiCommand {
    constructor() {
        super("exclude", {
            description: "Adds or removes excluded role from user. Excludes the user from being targeted by dad-bot.",
            aliases: ["exclude", "e", "excl"],
            clientPermissions: PermissionsBitField.Flags.ManageRoles,
            channel: "guild",
        });
    }

    public async execSlash(message: AkairoMessage<"cached">) {
        if (!dadbotCheck(message)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Dad-bot is not enabled")
                        .withErrorColor(message.guild),
                ],
            });
        }

        return excludeCommand(message, this.client);
    }

    public async exec(message: Message<true>): Promise<Message> {

        if (!dadbotCheck(message)) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Dad-bot is not enabled")
                        .withErrorColor(message.guild),
                ],
            });
        }

        return excludeCommand(message, this.client);
    }
}
