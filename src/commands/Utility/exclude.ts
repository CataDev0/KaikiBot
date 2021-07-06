import { Guild, Message, MessageEmbed } from "discord.js";
import { Exclude } from "../../lib/Embeds";
import { getGuildDocument } from "../../struct/documentMethods";
import { KaikiCommand } from "../../lib/KaikiClass";

export default class ExcludeCommand extends KaikiCommand {
	constructor() {
		super("exclude", {
			description: "Adds or removes excluded role from user. Excludes the user from being targeted by dadbot.",
			aliases: ["exclude", "e", "excl"],
			clientPermissions: "MANAGE_ROLES",
			channel: "guild",
		});
	}

	public async exec(message: Message): Promise<Message | void> {

		if (!message.guild!.isDadBotEnabled()) {
			return message.channel.send({
				embeds: [new MessageEmbed()
					.setTitle("Dadbot is not enabled")
					.withErrorColor(message)],
			});
		}

		const db = await getGuildDocument((message.guild as Guild).id);
		const embeds = [];
		let excludedRole = message.guild?.roles.cache.find((r) => r.name === db.settings.excludeRole);

		if (!message.guild?.roles.cache.some(r => r.name === excludedRole?.name)) {
			excludedRole = await message.guild?.roles.create({
				name: db.settings.excludeRole,
				reason: "Role didn't exist yet.",
			});

			embeds.push(new MessageEmbed({
				title: "Error!",
				description: `A role with name \`${db.settings.excludeRole}\` was not found in guild. Creating... `,
				footer: { text: "Beep boop..." },
			})
				.withErrorColor(message));
		}

		if (!message.member?.roles.cache.find((r) => r === excludedRole) && excludedRole) {
			await message.member?.roles.add(excludedRole);
			embeds.push(Exclude.addedRoleEmbed(db.settings.excludeRole)
				.withOkColor(message));
			return message.channel.send({ embeds: embeds });
		}

		if (message.member?.roles.cache.find((r) => r === excludedRole) && excludedRole) {
			await message.member?.roles.remove(excludedRole);
			embeds.push(Exclude.removedRoleEmbed(db.settings.excludeRole)
				.withOkColor(message));
			return message.channel.send({ embeds: embeds });
		}
	}
}
