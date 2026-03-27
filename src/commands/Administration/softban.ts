import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, GuildMember, Message, User } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "softban",
    aliases: ["sb"],
    description:
		"Bans and unbans a user by ID or name, with an optional message. Also removes all the users messages.",
    usage: "@notdreb Your behaviour is harmful",
    requiredUserPermissions: ["KickMembers", "ManageMessages"],
    requiredClientPermissions: ["BanMembers", "ManageMessages"],
    preconditions: ["GuildOnly"],
})
export default class BanCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args) {
        // Using both user and member to be able to user username as well as ids.
        const user = await Promise.resolve(
            args.pick("user").catch(async () => args.pick("member"))
        );

        // Default ban string
        const reason = await args
            .rest("string")
            .catch(
                () =>
                    `Softbanned by ${message.author.username} [${message.author.id}]`
            );

        const username =
			user instanceof User ? user.username : user.user.username;

        const guild = message.guild,
            guildClientMember = guild.members.me;

        const successBanEmbed = new EmbedBuilder({
            title: "Softbanned user",
            fields: [
                { name: "Username", value: username },
                { name: "ID", value: user.id, inline: true },
                { name: "Reason", value: reason, inline: true },
            ],
        }).withOkColor(message);

        // If user is currently in the guild
        const guildMember = await message.guild?.members.fetch(user.id).catch(() => null);

        if (!guildMember) {
            await message.guild?.members.ban(user, { reason: reason });
            return message.reply({ embeds: [successBanEmbed] });
        }

        // Check if member is ban-able
        if (
            message.author.id !== message.guild?.ownerId &&
			(message.member as GuildMember).roles.highest.position <=
				guildMember.roles.highest.position
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        description: `${message.author}, You can't use this command on users with a role higher or equal to yours in the role hierarchy.`,
                    }).withErrorColor(message),
                ],
            });
        }

        // x2
        else if (
            guildClientMember &&
			guildClientMember.roles.highest.position <=
				guildMember.roles.highest.position
        ) {
            return message.reply({
                embeds: [
                    new EmbedBuilder({
                        description:
							"Sorry, I don't have permissions to ban this member.",
                    }).withErrorColor(message),
                ],
            });
        }

        // Initial ban
        const m = await message.guild?.members.ban(user, {
            reason: reason,
            deleteMessageSeconds:
				Constants.MAGIC_NUMBERS.CMDS.ADMIN.SB_MSG_DEL_SECONDS,
        });

        try {
            await (m as GuildMember | User).send({
                embeds: [
                    new EmbedBuilder({
                        description: `You have been soft-banned from ${message.guild?.name || message.guildId}.\nReason: ${reason}`,
                    }).withOkColor(message),
                ],
            });
        } catch {
            // this 🤾‍♀️
        }

        // Unban
        try {
            await message.guild.members.unban(user.id);
        } catch {
            await message.guild.members.unban(user.id);
        }

        return message.reply({ embeds: [successBanEmbed] });
    }
}
