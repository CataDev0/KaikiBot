import { Guild } from "discord.js";
import { ValidActivities } from "../commands/Owner only/setActivity";
import { JSONToMessageOptions } from "../lib/GreetHandler";
import { HentaiTypes } from "../services/HentaiService";
import KaikiCommand from "../lib/Kaiki/KaikiCommand";
import { KaikiColor } from "../lib/Types/KaikiColor";
import { Categories } from "../lib/Types/Miscellaneous";
import { Sides } from "../commands/Gambling/betflip";
import { GachaType } from "../arguments/gachaType";

declare module "@sapphire/framework" {
	interface Preconditions {
		OwnerOnly: never;
	}

	interface ArgType {
		activityType: ValidActivities;
		category: Categories;
		command: KaikiCommand;
		gachaType: GachaType;
		guild: Guild;
		kaikiCoin: Sides;
		kaikiColor: KaikiColor;
		kaikiHentai: HentaiTypes;
		kaikiMoney: bigint;
		welcomeGoodbyeMessage: JSONToMessageOptions;
	}

	interface SapphireClient {
		initializeServices(): Promise<void>;
	}
}
