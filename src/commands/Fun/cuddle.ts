import { Command } from "@cataclym/discord-akairo";
import { Message, GuildMember } from "discord.js";
import sendWaifuPics from "./waifuPics";

export default class Cuddle extends Command {
	constructor() {
		super("cuddle", {
			aliases: ["cuddle"],
			description: { description: "Cuddle someone!", usage: ["", "@dreb"] },
			typing: true,
			args: [{
				id: "mention",
				type: "member",
				default: null,
			}],
		});
	}
	public async exec(message: Message, { mention }: { mention: GuildMember | null }): Promise<Message> {
		return message.channel.send(await sendWaifuPics(message, "cuddle", mention));
	}
}

