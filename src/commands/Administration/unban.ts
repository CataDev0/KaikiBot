import { Command } from "@cataclym/discord-akairo";
import { Message, MessageEmbed, User } from "discord.js";

export default class UnbanCommand extends Command {
	constructor() {
		super("unban", {
			aliases: ["unban", "ub"],
			userPermissions: "BAN_MEMBERS",
			clientPermissions: "BAN_MEMBERS",
			args: [
				{
					id: "user",
					type: "user",
					otherwise: (m: Message) => new MessageEmbed({
						description: "Can't find this user.",
					})
						.withErrorColor(m),
				},
			],
		});
	}
	public async exec(message: Message, { user }: { user: User }): Promise<Message> {

		const bans = await message.guild?.fetchBans();

		if (bans?.find((u) => u.user.id === user.id)) {
			await message.guild?.members.unban(user);
			return message.channel.send(new MessageEmbed({
				description: `Unbanned ${user.tag}.`,
			})
				.withOkColor(message));
		}
		else {
			return message.channel.send(new MessageEmbed({
				description: "This user is not banned.",
			})
				.withErrorColor(message));
		}
	}
}