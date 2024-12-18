import { ApplyOptions } from "@sapphire/decorators";
import { ChatInputCommand, Command } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import SlashCommandsLib from "../../lib/SlashCommands/SlashCommandsLib";

@ApplyOptions<KaikiCommandOptions>({
    name: "exclude",
    aliases: ["excl", "e"],
    usage: "",
    description:
		"Excludes you from being targeted by dad-bot. Execute command again to reverse this action.",
    requiredClientPermissions: ["ManageRoles"],
    preconditions: ["GuildOnly"],
})
export default class ExcludeCommand extends KaikiCommand {
    public override registerApplicationCommands(
        registry: ChatInputCommand.Registry
    ) {
        registry.registerChatInputCommand(SlashCommandsLib.excludeData);
    }

    public async messageRun(message: Message<true>) {
        return this.runMessageInteraction(message);
    }

    public async chatInputRun(
        interaction: Command.ChatInputCommandInteraction<"cached">
    ) {
        return this.runMessageInteraction(interaction);
    }

    private runMessageInteraction(
        message: Message<true> | Command.ChatInputCommandInteraction<"cached">
    ) {
        if (!message.guild.isDadBotEnabledInGuildOnly()) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Dad-bot is not enabled")
                        .withErrorColor(message.guild),
                ],
            });
        }

        return SlashCommandsLib.excludeCommand(message);
    }
}
