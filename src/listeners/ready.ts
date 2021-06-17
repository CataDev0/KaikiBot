import { Listener } from "@cataclym/discord-akairo";
import { MessageEmbed } from "discord.js";
import logger from "loglevel";
import { birthdayService } from "../lib/AnniversaryRoles";
import { dailyResetTimer, emoteDataBaseService } from "../lib/functions";
import { customClient } from "../struct/client";
import { guildsModel } from "../struct/models";

export default class ReadyListener extends Listener {
	constructor() {
		super("ready", {
			event: "ready",
			emitter: "client",
			type: "once",
		});
	}

	public async exec(): Promise<void> {

		this.client.guilds.cache.forEach(g => {
			g.commands.create({
				name: "exclude",
				description: "Excludes you from being targeted by dadbot.",
			})
				.catch(() => logger.warn(`${g.name} [${g.id}] refused creating slash commands. This is sometimes expected.`));
		});


		logger.info(`Created slash commands in ${this.client.guilds.cache.size} guilds.`);

		dailyResetTimer(this.client)
			.then(async () => {
				logger.info("dailyResetTimer | Reset timer initiated.");
				birthdayService(this.client);
				setTimeout(async () => emoteDataBaseService(this.client)
					.then(i => {
						if (i > 0) {
							logger.info("dataBaseService | " + i + " new emote(s) added!\n");
						}
					}), 2000);
				logger.info("birthdayService | Service initiated");
			});

		logger.info(`dataBaseService | ${await guildsModel.countDocuments()} guilds registered in DB.\n`);

		// Let bot owner know when bot goes online.
		if (["Tsukihi Araragi", "Kaiki Deishū"].includes(this.client.user?.username as string)) {
			await this.client.users.fetch("140788173885276160")
				.then(async user => user
					.send(new MessageEmbed()
						.setDescription("Bot is online.")
						.withOkColor(),
					),
				);
		}

		const botDocument = { activity: await (this.client as customClient).botSettings.get((this.client as customClient).botSettingID, "activity", ""),
			activityType: await (this.client as customClient).botSettings.get((this.client as customClient).botSettingID, "activityType", "") };

		if (botDocument.activity.length && botDocument.activityType.length) {
			this.client.user?.setActivity({
				name: botDocument.activity,
				type: botDocument.activityType,
			});
		}
	}
}