import { Listener } from "@cataclym/discord-akairo";
import { Guild } from "discord.js";
import { checkBirthdayOnAdd } from "../nsb/AnniversaryRoles";
import { emoteDataBaseService } from "../nsb/functions";

module.exports = class GuildCreate extends Listener {
	constructor() {
		super("guildCreate", {
			event: "guildCreate",
			emitter: "client",
		});
	}

	public async exec(guild: Guild) {
		console.log(`\nBot was added to ${guild.name}!! ${guild.memberCount} members!\n`);
		await emoteDataBaseService(guild);
		await checkBirthdayOnAdd(guild);
	}
};

