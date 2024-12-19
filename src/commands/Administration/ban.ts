import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, GuildMember, Message, User } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "ban",
    aliases: ["bean", "b"],
    description: "Bans a user by ID or name with an optional message.",
    usage: "@notdreb Your behaviour is harmful",
    requiredUserPermissions: ["BanMembers"],
    requiredClientPermissions: ["BanMembers"],
    preconditions: ["GuildOnly"],
})
export default class BanCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args) {
        // Using both user and member to be able to use username as well as ids.
        const user = await Promise.resolve(
            args.pick("user").catch(async () => args.pick("member"))
        );

        // Pick up ban reason
        const reason = await args
            .rest("string")
        // Default ban string
            .catch(
                () =>
                    `Banned by ${message.author.username} [${message.author.id}]`
            );

        const username =
			user instanceof User ? user.username : user.user.username;

        const guild = message.guild,
            guildClientMember = guild.members.me;

        const successBan = new EmbedBuilder({
            title: "Banned user",
            fields: [
                { name: "Username", value: username },
                { name: "ID", value: user.id, inline: true },
                { name: "Reason", value: reason, inline: true },
            ],
        }).withOkColor(message);

        // If user is currently in the guild
        const guildMember = message.guild?.members.cache.get(user.id);

        if (!guildMember) {
            await message.guild?.members.ban(user, { reason: reason });
            return message.reply({ embeds: [successBan] });
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

        const m = await message.guild?.members.ban(user, { reason: reason });

        try {
            await (m as GuildMember | User).send({
                embeds: [
                    new EmbedBuilder({
                        description: `You have been banned from \`${message.guild?.name}\` [\`${message.guildId}\`].\n\n**Reason**: ${reason}`,
                    }).withOkColor(message)
                ]
            });
        } catch {
            successBan.setFooter({ text: "Couldn't send a DM to the user." });
        }

        return message.reply({ embeds: [successBan] });
    }
}
