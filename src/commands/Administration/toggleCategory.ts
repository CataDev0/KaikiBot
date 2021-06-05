import { Category, Command } from "@cataclym/discord-akairo";
import { Guild, Message, MessageEmbed } from "discord.js";
import { noArgGeneric } from "../../lib/Embeds";
import { getGuildDocument } from "../../struct/db";

export default class ToggleCategoryCommand extends Command {
	constructor() {
		super("togglecategory", {
			aliases: ["togglecategory", "tc"],
			userPermissions: "ADMINISTRATOR",
			channel: "guild",
			description: { description: "Toggles a category", usage: "Anime" },
			args: [
				{
					id: "category",
					type: (_, phrase) => {
						return this.handler.categories.find((__, k) => {

							k = k.toLowerCase();

							return phrase
								.toLowerCase()
								.startsWith(k.slice(0, Math.max(phrase.length - 1, 1)));
						});
					},
					otherwise: (msg: Message) => noArgGeneric(msg),
				},
			],
		});
	}
	public async exec(message: Message, { category }: { category: Category<string, Command> }): Promise<Message> {

		const guild = (message.guild as Guild),
			db = await getGuildDocument(guild.id),
			bool = !db.blockedCategories[category.id];

		db.blockedCategories[category.id] = bool;
		db.markModified(`blockedCategories.${category.id}`);
		db.save();

		return message.channel.send(new MessageEmbed()
			.setDescription(`${category.id} has been ${bool ? "disabled" : "enabled"}.`)
			.withOkColor(message),
		);
	}
}