import { container } from "@sapphire/pieces";
import { GuildMember, Message, PermissionsBitField } from "discord.js";
import Constants from "../struct/Constants";

interface CustomMessageType extends Message<true> {
	member: GuildMember;
}

export class DadBot {
    public static async run(message: Message<true>) {
        if (!this.preCheck(message)) return;

        const nick = await this.checkDadBotMatches(message);

        if (!nick) return;

        return await this.replyAndSave(message, nick);
    }

    private static preCheck(
        message: Message<true>
    ): message is CustomMessageType {
        if (!message.member) return false;
        if (message.content.includes("||")) return false;
        if (!message.isDadEnabledGuild()) return false;

        return !message.member.hasExcludedRole();
    }

    private static async checkDadBotMatches(message: CustomMessageType) {
        for (const item of Constants.dadBotArray) {
            const r = new RegExp(
                `(^|\\s|$)(?<statement>(?<prefix>${item})\\s*(?<nickname>.*)$)`,
                "mi"
            );
            if (r.test(message.content)) {
                let match = message.content.match(r)?.groups?.nickname;
                if (!match) continue;

                if (match.replace(/[\u3164\u2800\u200B-\u200D\uFEFF]/g, "").trim().length === 0)
                    continue;

                const splits = match.split(new RegExp(`${item}`, "mig"));
                if (splits.length > 1)
                    match = splits.reduce((a, b) =>
                        a.length <= b.length && a.length > 0 ? a : b
                    );

                if (match.length &&
					match.length <=
						parseInt(
						    process.env.DADBOT_NICKNAME_LENGTH ||
								String(
								    Constants.MAGIC_NUMBERS.CMDS.ETC.DAD_BOT
								        .DADBOT_NICK_LENGTH
								)
						)
                ) {
                    return match;
                }
            }
        }
        return false;
    }

    private static async replyAndSave(
        message: CustomMessageType,
        nick: string
    ) {
        await message.reply({
            content: `Hi, ${nick}`,
            allowedMentions: {},
        });

        message.client.cache.incrementCommand("dadbot");

        if (
            nick.length <=
			parseInt(
			    process.env.DADBOT_NICKNAME_LENGTH ||
					String(
					    Constants.MAGIC_NUMBERS.CMDS.ETC.DAD_BOT
					        .DADBOT_NICK_LENGTH
					)
			)
        ) {
            const user = message.author;
            const position =
				message.guild.members.me?.roles.highest.comparePositionTo(
				    message.member.roles.highest
				);

            if (
                user.id !== message.guild?.ownerId &&
				message.guild.members.me?.permissions.has(
				    PermissionsBitField.Flags.ManageNicknames
				) &&
				position
                    ? position >= 0
                    : false
            ) {
                // Avoids setting nickname on Server owners
                await message.member
                    ?.setNickname(nick)
                    .catch(() =>
                        container.logger.warn(
                            `Insufficient permissions to set member's nickname [${message.member?.user.id}]`
                        )
                    );
            }
        }
        await DadBot.saveUsername(message, nick);
    }
    private static async saveUsername(
        message: CustomMessageType,
        nick: string
    ) {
        return container.client.orm.userNicknames.create({
            data: {
                GuildUsers: {
                    connectOrCreate: {
                        create: {
                            UserId: BigInt(message.author.id),
                            GuildId: BigInt(message.guildId),
                        },
                        where: {
                            UserId_GuildId: {
                                UserId: BigInt(message.author.id),
                                GuildId: BigInt(message.guildId),
                            },
                        },
                    },
                },
                Nickname: nick,
            },
        });
    }
}
