import { Snowflake } from "discord.js";
import { ERCacheType } from "../../Cache/KaikiCache";

export type EmoteTrigger = string;
export type GuildString = Snowflake;
export type TriggerObject = { id: string; regex?: RegExp };
export type EmoteReactCache = Map<
	GuildString,
	Map<ERCacheType, Map<EmoteTrigger, TriggerObject>>
>;

export type PartitionResult = [[string, bigint][], [string, bigint][]];
