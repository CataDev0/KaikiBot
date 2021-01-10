import { Command } from "@cataclym/discord-akairo";
import { Message, MessageEmbed } from "discord.js";
import { errorColor } from "../../nsb/Util";
import { grabHentai, typesArray } from "./hentaiService";

export default class HentaiBombCommand extends Command {
	constructor() {
		super("hentaibomb", {
			aliases: ["hentaibomb", "hb"],
			description: { description: "Posts 5 NSFW images, using the waifu.pics API",
				usage: typesArray },
			args: [
				{
					id: "category",
					type: typesArray,
					default: null,
				},
			],
		});
	}

	public async exec(message: Message, { category }: { category: "waifu" | "neko" | "trap" | "blowjob" | null }): Promise<Message | Message[]> {

		if (message.channel.type === "text" && message.channel.nsfw) {

			const megaResponse = (await grabHentai(category ?? typesArray[Math.floor(Math.random() * typesArray.length)], "bomb")).splice(0, 5);

			return message.channel.send(megaResponse, { split: true });
		}

		else {
			return message.channel.send(new MessageEmbed({
				title: "Error",
				description: "Channel is not NSFW.",
				color: errorColor,
			}));
		}
	}
}