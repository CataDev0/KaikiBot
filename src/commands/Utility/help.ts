import { ApplyOptions } from "@sapphire/decorators";
import { ApplicationCommandRegistry, Args } from "@sapphire/framework";
import { ChatInputCommandInteraction, EmbedBuilder, Message } from "discord.js";
import { Subcommand } from "@sapphire/plugin-subcommands";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "help",
    aliases: ["h"],
    description: "Shows help message or command info",
    usage: "ping",
    minorCategory: "Info",
})
export default class HelpCommand extends KaikiCommand {

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(
            (builder) =>
                builder
                    .setName("help")
                    .setDescription("Shows help message or command info")
                    .addStringOption((option) =>
                        option
                            .setName("command")
                            .setDescription("The command to get info on")
                            .setRequired(false)
                    )
        );
    }

    private createHelpEmbed(message: Message | ChatInputCommandInteraction, prefix: string, avatarURL: string, userAvatarURL: string) {
        const { name, repository, version } = this.client.package;
        return new EmbedBuilder()
            .setTitle(`${this.client.user?.username} help page`)
            .setDescription(`Current prefix: \`${prefix}\``)
            .addFields([
                {
                    name: "📋 Category list",
                    value: `\`${prefix}cmds\` returns a complete list of command categories.`,
                    inline: false,
                },
                {
                    name: "🗒️ Command list",
                    value: `\`${prefix}cmds <category>\` returns a complete list of commands in the given category.`,
                    inline: false,
                },
                {
                    name: "🔍 Command Info",
                    value: `\`${prefix}help [command]\` to get more help. Example: \`${prefix}help ping\``,
                    inline: false,
                },
                {
                    name: "Policies",
                    value: `[Privacy policy](${Constants.LINKS.PRIVACY_POLICY}) | [Terms of Use](${Constants.LINKS.TERMS_OF_USE})`
                }
            ])
            .setAuthor({
                name: `${name} v${version}`,
                iconURL: userAvatarURL,
                url: repository.url,
            })
            .setFooter({
                text: "Made by Cata <3",
                iconURL: avatarURL,
            })
            .withOkColor(message);
    }

    private createCommandEmbed(command: KaikiCommand, prefix: string, embed: EmbedBuilder) {
        const aliases = Array.from(command.aliases)
            .sort((a, b) => b.length - a.length || a.localeCompare(b))
            .join("`, `");

        const extractedCommandUsage =
            command instanceof Subcommand
                ? command.options.usage
                : command.usage;

        const commandUsage = extractedCommandUsage
            ? Array.isArray(extractedCommandUsage)
                ? extractedCommandUsage
                    .sort(
                        (a, b) =>
                            b.length - a.length || a.localeCompare(b)
                    )
                    .map((u) => `${prefix}${command.name} ${u}`)
                    .join("\n")
                : `${prefix}${command.name} ${extractedCommandUsage}`
            : `${prefix}${command.name}`;

        const cooldown =
            command.options.cooldownDelay ||
            this.client.options.defaultCooldown?.delay ||
            0;

        if (aliases.length) {
            embed.addFields([
                {
                    name: "**Aliases**",
                    value: `\`${aliases}\``,
                },
            ]);
        }

        embed
            .setTitle(`${prefix}${command.name}`)
            .setDescription(
                command.description || "Command is missing description."
            )
            .addFields([
                {
                    name: "**Usage**",
                    value: commandUsage,
                    inline: false,
                },
                {
                    name: "Cooldown",
                    value: `${cooldown / 1000}s`,
                },
            ])
            .setFooter({ text: command.category || "N/A" });

        if (Array.isArray(command.options.flags)) {
            embed.addFields({
                name: "Flags",
                value: command.options.flags
                    .map((flag: string) => `--${flag}`)
                    .join(", "),
            });
        }

        if (command.options.requiredUserPermissions) {
            embed.addFields([
                {
                    name: "Requires",
                    value: command.options.requiredUserPermissions.toString(),
                    inline: false,
                },
            ]);
        }
        
        return embed;
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        const prefix = await this.client.fetchPrefix(interaction);
        let embed = new EmbedBuilder().withOkColor(interaction.guild ?? undefined);

        const commandParam = interaction.options.getString("command");

        if (!commandParam) {
            embed = this.createHelpEmbed(interaction, prefix, this.client.owner.displayAvatarURL(), interaction.user.displayAvatarURL());
            return interaction.reply({ embeds: [embed] });
        }

        const { container } = await import("@sapphire/framework");
        const cmds = container.stores.get("commands");

        let command: KaikiCommand | undefined = (cmds.find((k) => k.name.toLowerCase() === commandParam.toLowerCase()) as KaikiCommand | undefined) ||
                      (cmds.aliases.get(commandParam.toLowerCase()) as KaikiCommand | undefined);

        if (!command) {
            command = cmds.find((k) => k.name.toLowerCase().startsWith(commandParam.toLowerCase())) as KaikiCommand | undefined;
        }

        if (command) {
            embed = this.createCommandEmbed(command, prefix, embed);
            return interaction.reply({ embeds: [embed] });
        } else {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder({
                        description: `**${interaction.user.username}** Command \`${commandParam}\` not found.`,
                    }).withErrorColor(interaction.guild ?? undefined),
                ],
            });
        }
    }

    public async messageRun(message: Message, args: Args) {
        const prefix = await this.client.fetchPrefix(message);
        let embed = new EmbedBuilder().withOkColor(message);

        if (args.finished) {
            embed = this.createHelpEmbed(message, prefix, this.client.owner.displayAvatarURL(), message.author.displayAvatarURL());
            return message.reply({ embeds: [embed] });
        }

        const command = await args.pick("command").catch(() => undefined);

        if (command) {
            embed = this.createCommandEmbed(command, prefix, embed);
            return message.reply({ embeds: [embed] });
        } else {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        description: `**${message.author.username}** Command \`${args.next()}\` not found.`,
                    }).withErrorColor(message),
                ],
            });
        }
    }
}
