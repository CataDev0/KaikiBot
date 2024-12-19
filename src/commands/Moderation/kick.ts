import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Guild, GuildMember, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "kick",
    aliases: ["k"],
    description: "Kicks a user by ID or name with an optional message.",
    usage: ["<@some Guy> Your behaviour is harmful."],
    requiredUserPermissions: ["KickMembers"],
    requiredClientPermissions: ["KickMembers"],
    preconditions: ["GuildOnly"],
})
export default class KickCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const member = await args.pick("member");
        const reason = await args.rest("string").catch(() => "Kicked");

        const guild = message.guild as Guild;
        const guildClientMember = guild.members.me as GuildMember;

        if (
            message.author.id !== message.guild?.ownerId &&
			(message.member as GuildMember).roles.highest.position <=
				member.roles.highest.position
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        description:
							"You don't have permissions to kick this member.",
                    }).withErrorColor(message),
                ],
            });
        } else if (
            guildClientMember.roles.highest.position <=
			member.roles.highest.position
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        description:
							"Sorry, I don't have permissions to kick this member.",
                    }).withErrorColor(message),
                ],
            });
        }

        const embed = new EmbedBuilder({
            title: "Kicked user",
            fields: [
                { name: "Username", value: member.user.username, inline: true },
                { name: "ID", value: member.user.id, inline: true },
            ],
        }).withOkColor(message);

        const m = await member.kick(reason);

        try {
            await m.user.send({
                embeds: [
                    new EmbedBuilder({
                        description: `You have been kicked from \`${message.guild?.name}\` [\`${message.guildId}\`].\n\n**Reason**: ${reason}`,
                    }).withErrorColor(message),
                ],
            });
        } catch {
            embed.setFooter({ text: "Couldn't send a DM to the user." });
        }

        return message.reply({ embeds: [embed] });
    }
}
