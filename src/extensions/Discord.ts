import {
    ChatInputCommandInteraction,
    ColorResolvable,
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
		withOkColor(): this;
		withOkColor(m: Message): this;
		withOkColor(m: Guild): this;
		withOkColor(m: ChatInputCommandInteraction): this;
		withOkColor(m?: Message | Guild | ChatInputCommandInteraction): this;

		withErrorColor(): this;
		withErrorColor(m: Message): this;
		withErrorColor(m: Guild): this;
		withErrorColor(m: ChatInputCommandInteraction): this;
		withErrorColor(m?: Message | Guild | ChatInputCommandInteraction): this;
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

function withErrorColor(this: EmbedBuilder): EmbedBuilder;
function withErrorColor(this: EmbedBuilder, m: Message): EmbedBuilder;
function withErrorColor(this: EmbedBuilder, m: Guild): EmbedBuilder;
function withErrorColor(this: EmbedBuilder, m: ChatInputCommandInteraction): EmbedBuilder;
function withErrorColor(this: EmbedBuilder, m: Message | Guild | ChatInputCommandInteraction): EmbedBuilder;
function withErrorColor(
    this: EmbedBuilder,
    messageOrGuild?: Message | Guild | ChatInputCommandInteraction
): EmbedBuilder {
    if (messageOrGuild) {
        if (messageOrGuild instanceof Message && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId,
                "ErrorColor",
                Constants.errorColor
            );

            return this.setColor(color as ColorResolvable);
        } else if (messageOrGuild instanceof ChatInputCommandInteraction && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId!,
                "ErrorColor",
                Constants.errorColor
            );

            return this.setColor(color as ColorResolvable);
        } else if (messageOrGuild instanceof Guild) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.id,
                "ErrorColor",
                Constants.errorColor
            );

            return this.setColor(color as ColorResolvable);
        }
    }

    return this.setColor(Constants.errorColor);
}

EmbedBuilder.prototype.withErrorColor = withErrorColor;

function withOkColor(this: EmbedBuilder): EmbedBuilder;
function withOkColor(this: EmbedBuilder, m: Message): EmbedBuilder;
function withOkColor(this: EmbedBuilder, m: Guild): EmbedBuilder;
function withOkColor(this: EmbedBuilder, m: ChatInputCommandInteraction): EmbedBuilder;
function withOkColor(this: EmbedBuilder, m: Message | Guild | ChatInputCommandInteraction): EmbedBuilder;
function withOkColor(
    this: EmbedBuilder,
    messageOrGuild?: Message | Guild | ChatInputCommandInteraction
): EmbedBuilder {
    if (messageOrGuild) {
        if (messageOrGuild instanceof Message && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId,
                "OkColor",
                Constants.okColor
            );

            return this.setColor(color as ColorResolvable);
        } else if (messageOrGuild instanceof ChatInputCommandInteraction && messageOrGuild.inGuild()) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.guildId!,
                "OkColor",
                Constants.okColor
            );

            return this.setColor(color as ColorResolvable);
        } else if (messageOrGuild instanceof Guild) {
            const color = messageOrGuild.client.guildsDb.get(
                messageOrGuild.id,
                "OkColor",
                Constants.okColor
            );

            return this.setColor(color as ColorResolvable);
        }
    }

    return this.setColor(Constants.okColor);
}

EmbedBuilder.prototype.withOkColor = withOkColor;
