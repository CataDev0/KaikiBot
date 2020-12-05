import "discord.js";
import db from "quick.db";
const guildConfig = new db.table("guildConfig");

let enabledDadBotGuilds = guildConfig.get("dadbot");
export async function updateVar(value: string[]): Promise<void> {
	enabledDadBotGuilds = value;
}

declare module "discord.js" {
    export interface Guild {
        isDadBotEnabled(d?: Guild): boolean;
    }
}

import { Guild } from "discord.js";

Guild.prototype.isDadBotEnabled = (d = this): boolean => {
	return enabledDadBotGuilds?.includes(d?.id);
};