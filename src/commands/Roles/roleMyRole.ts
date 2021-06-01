import { Command, PrefixSupplier } from "@cataclym/discord-akairo";
import { Snowflake } from "discord-api-types";
import { Guild, Message, MessageEmbed } from "discord.js";
import { resolveColor } from "../../lib/Color";
import { trim } from "../../lib/Util";
import { getGuildDB } from "../../struct/db";

export default class MyRoleCommand extends Command {
	constructor() {
		super("myrole", {
			aliases: ["myrole", "mr"],
			clientPermissions: ["MANAGE_ROLES"],
			channel: "guild",
			prefix: (msg: Message) => {
				const p = (this.handler.prefix as PrefixSupplier)(msg);
				return [p as string, ";"];
			},
			description: {
				description: "Checks your assigned user role. Add a hexcode to change the colour.",
				usage: "name/color FF0000",
			},
			args: [
				{
					id: "name",
					flag: ["name"],
					match: "rest",
				},
				{
					id: "color",
					flag: ["color"],
					match: "option",
				},
			],
		});
	}
	public async exec(message: Message, { name, color }: { name?: string, color?: string }): Promise<Message> {

		const guild = (message.guild as Guild);

		const embedFail = async (text = "You do not have a role!") => {
			return new MessageEmbed()
				.setDescription(text)
				.withErrorColor(message);
		};

		const db = await getGuildDB(guild.id),
			roleID = db.userRoles[message.author.id];

		if (!roleID) return message.channel.send(await embedFail());

		const myRole = guild.roles.cache.get(roleID as Snowflake);
		name = name?.slice(5);

		if (!myRole) {
			delete db.userRoles[message.author.id];
			db.markModified("userRoles");
			db.save();
			return message.channel.send(await embedFail());
		}

		if (name ?? color) {

			const botRole = message.guild?.me?.roles.highest,
				isPosition = botRole?.comparePositionTo(myRole);

			if (isPosition && isPosition <= 0) {
				return message.channel.send(await embedFail("This role is higher than me, I cannot edit this role!"));
			}

			if (color) {
				const hexCode = await resolveColor(color),
					oldHex = myRole.hexColor;
				await myRole.setColor(hexCode);
				return message.channel.send(new MessageEmbed()
					.setDescription(`You have changed ${myRole.name}'s color from ${oldHex} to ${hexCode}!`)
					.setColor(hexCode),
				);
			}

			else {
				const oldName = myRole.name;
				await myRole.setName(trim(name!, 32));
				return message.channel.send(new MessageEmbed()
					.setDescription(`You have changed ${oldName}'s name to ${name}!`)
					.setColor(myRole.color),
				);
			}
		}

		else {
			return message.channel.send(new MessageEmbed()
				.setAuthor(`Current role assigned to ${message.author.username}`,
					guild.iconURL({ size: 2048, dynamic: true })
						|| message.author.displayAvatarURL({ size: 2048, dynamic: true }))
				.setColor(myRole.hexColor)
				.addField("Name", `${myRole.name}`, true)
				.addField("Colour", `${myRole.hexColor}`, true));
		}
	}
}