import {
    EmbedBuilder,
    Guild,
    GuildMember,
    Message,
} from "discord.js";
import IKaikiClient from "../lib/Kaiki/IKaikiClient";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";
import Constants from "../struct/Constants";

declare module "discord.js" {
	interface Client extends IKaikiClient {
		id: string | null;
	}

	export interface Guild {
		isDadBotEnabledInGuildOnly(): boolean;

		client: KaikiSapphireClient<true>;
	}

	export interface GuildMember {
		hasExcludedRole(): boolean;

		client: KaikiSapphireClient<true>;
	}

	export interface Message {
		getMemberColorAsync(member?: GuildMember): Promise<ColorResolvable>;

		isDadBotEnabledInGuildAndChannel(): boolean;

		client: KaikiSapphireClient<true>;
	}

	export interface EmbedBuilder {
		withOkColor(m?: Message | Guild): this;

		withErrorColor(m?: Message | Guild): this;
	}

	export interface ButtonInteraction {
		client: KaikiSapphireClient<true>;
	}
}

GuildMember.prototype.hasExcludedRole = function () {
    const roleId = this.guild.client.guildsDb.get(
        this.guild.id,
        "ExcludeRole",
        undefined
    );

    return !!this.roles.cache.get(roleId);
};

Guild.prototype.isDadBotEnabledInGuildOnly = function () {
    return !!(this && this.client.guildsDb.get(this.id, "DadBot", false));
};

Message.prototype.isDadBotEnabledInGuildAndChannel = function () {
    if (!this.inGuild()) return false;

    if (!this.guild.isDadBotEnabledInGuildOnly()) return false;

    // Return true when value is undefined
    return !this.client.dadBotChannels.items.get(this.channelId);
};

EmbedBuilder.prototype.withErrorColor = function (
    messageOrGuild?: Message | Guild
) {
    if (messageOrGuild) {
        if (messageOrGuild instanceof Message && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId,
                "ErrorColor",
                Constants.errorColor
            );

            return this.setColor(Array.isArray(color) ? color : Number(color));
        } else {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.id,
                "ErrorColor",
                Constants.errorColor
            );

            return this.setColor(Array.isArray(color) ? color : Number(color));
        }
    }

    return this.setColor(Constants.errorColor);
};

EmbedBuilder.prototype.withOkColor = function (
    messageOrGuild?: Message | Guild
) {
    if (messageOrGuild) {
        if (messageOrGuild instanceof Message && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId,
                "OkColor",
                Constants.okColor
            );

            return this.setColor(Array.isArray(color) ? color : Number(color));
        } else {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.id,
                "OkColor",
                Constants.okColor
            );

            return this.setColor(Array.isArray(color) ? color : Number(color));
        }
    }

    return this.setColor(Constants.okColor);
};
