import { Argument } from "discord-akairo";
import KaikiCommand from "Kaiki/KaikiCommand";
import { Snowflake } from "discord-api-types";
import { Guild, GuildMember, Message, MessageEmbed, Permissions, User } from "discord.js";

export default class BanCommand extends KaikiCommand {
    constructor() {
        super("ban", {
            aliases: ["ban", "bean", "b"],
            userPermissions: Permissions.FLAGS.BAN_MEMBERS,
            clientPermissions: Permissions.FLAGS.BAN_MEMBERS,
            description: "Bans a user by ID or name with an optional message.",
            usage: "@notdreb Your behaviour is harmful",
            channel: "guild",
            args: [{
                id: "user",
                type: Argument.union("member", "user", async (_, phrase) => {
                    const u = await this.client.users.fetch(phrase as Snowflake);
                    return u || null;
                }),
                otherwise: (m: Message) => ({
                    embeds: [new MessageEmbed({
                        description: "Can't find this user.",
                    })
                        .withErrorColor(m)] }),
            },
            {
                id: "reason",
                type: "string",
                match: "restContent",
                default: "No reason specified",
            }],
        });
    }
    public async exec(message: Message, { user, reason }: { user: GuildMember | User, reason: string}): Promise<Message> {

        const guild = message.guild as Guild,
            guildClientMember = guild.me as GuildMember;

        const successBan = new MessageEmbed({
            title: "Banned user",
            fields: [
                { name: "Username", value: user instanceof GuildMember
                    ? user.user.username
                    : user.username, inline: true },
                { name: "ID", value: user.id, inline: true },
            ],
        })
            .withOkColor(message);

        // If user is currently in the guild
        const guildMember = message.guild?.members.cache.get(user.id);

        if (!guildMember) {
            await message.guild?.members.ban(user, { reason: reason });
            return message.channel.send({ embeds: [successBan] });
        }

        // Check if member is bannable
        if (message.author.id !== message.guild?.ownerId &&
			(message.member as GuildMember).roles.highest.position <= guildMember.roles.highest.position) {

            return message.channel.send({ embeds: [new MessageEmbed({
                description: `${message.author}, You can't use this command on users with a role higher or equal to yours in the role hierarchy.`,
            })
                .withErrorColor(message)] });
        }

        // x2
        else if (guildClientMember.roles.highest.position <= guildMember.roles.highest.position) {
            return message.channel.send({ embeds: [new MessageEmbed({
                description: "Sorry, I don't have permissions to ban this member.",
            })
                .withErrorColor(message)],
            });
        }

        await message.guild?.members.ban(user, { reason: reason }).then(m => {
            try {
                (m as GuildMember | User).send({ embeds: [new MessageEmbed({
                    description: `You have been banned from ${message.guild?.name}.\nReason: ${reason}`,
                })
                    .withOkColor(message)],
                });
            }
            catch {
                // ignored
            }
        })
            .catch((err) => console.log(err));

        return message.channel.send({ embeds: [successBan] });
    }
}
