import {
    APIEmbed,
    ChannelType,
    EmbedBuilder,
    Guild,
    GuildMember,
    Message,
    MessageCreateOptions,
    PermissionsBitField,
    StickerResolvable,
    userMention,
} from "discord.js";

interface MemberMessage extends Message<true> {
	member: GuildMember;
}

interface SendMessageData {
	channel: bigint | null;
	message: string | null;
	timeout: number | null;
}

export default class GreetHandler {
    private replacements: Map<string, (m: GuildMember) => string> = new Map();
    private readonly guildMember: GuildMember;

    constructor(guildMember: GuildMember) {
        this.replacements.set("%guild%", (m) => m.guild.name);
        this.replacements.set("%guild.name%", (m) => m.guild.name);
        this.replacements.set("%guild.id%", (m) => m.guild.id);
        this.replacements.set(
            "%guild.icon%",
            (m) => m.guild.iconURL() || "N/A"
        );
        this.replacements.set("%member%", (m) => m.user.username);
        this.replacements.set("%member.name%", (m) => m.user.username);
        this.replacements.set("%member.id%", (m) => m.id);
        this.replacements.set("%member.mention%", (m) => userMention(m.id));
        this.replacements.set(
            "%member.avatar%",
            (m) => m.user.avatarURL() || "N/A"
        );

        this.guildMember = guildMember;
    }

    static emptyMessageOptions = (m: Message | Guild) => ({
        embeds: [
            new EmbedBuilder()
                .setTitle("No data")
                .setTitle("No welcome/bye message set.")
                .withErrorColor(m),
        ],
    });

    private static genericGreetMessage = (m: Message | Guild) => ({
        embeds: [
            new EmbedBuilder()
                .setTitle("Happy to see you %member.name%!")
                .setDescription("Welcome to %guild.name%")
                .withOkColor(m),
        ],
    });

    private static genericByeMessage(m: Message | Guild) {
        return {
            embeds: [
                new EmbedBuilder()
                    .setTitle("%member.name% just left")
                    .withErrorColor(m),
            ],
        };
    }

    async handleGreetMessage() {
        const db = await this.guildMember.client.db.getOrCreateGuild(
            BigInt(this.guildMember.guild.id)
        );

        if (!db.WelcomeChannel) {
            return;
        }

        if (!db.WelcomeMessage)
            db.WelcomeMessage = JSON.stringify(
                GreetHandler.genericGreetMessage(this.guildMember.guild)
            );

        return this.sendWelcomeLeaveMessage({
            channel: db.WelcomeChannel,
            message: db.WelcomeMessage,
            timeout: db.WelcomeTimeout,
        });
    }

    async handleGoodbyeMessage() {
        const db = await this.guildMember.client.db.getOrCreateGuild(
            BigInt(this.guildMember.guild.id)
        );

        if (!db.ByeChannel) {
            return;
        }

        if (!db.ByeMessage)
            db.ByeMessage = JSON.stringify(
                GreetHandler.genericByeMessage(this.guildMember.guild)
            );

        return this.sendWelcomeLeaveMessage({
            channel: db.ByeChannel,
            message: db.ByeMessage,
            timeout: db.ByeTimeout,
        });
    }

    async createAndParseGreetMsg(
        data: SendMessageData
    ): Promise<MessageCreateOptions> {
        if (!data.message) {
            return GreetHandler.emptyMessageOptions(this.guildMember.guild);
        }

        let messageOptions: MessageCreateOptions;
        try {
            messageOptions = JSON.parse(
                await this.parsePlaceHolders(data.message)
            );
        } catch (e) {
            return GreetHandler.emptyMessageOptions(this.guildMember.guild);
        }

        if (
            !messageOptions.embeds?.every(
                (object) => !!Object.keys(object).length
            )
        ) {
            messageOptions.embeds = undefined;
        }

        return messageOptions;
    }

    async sendWelcomeLeaveMessage(data: SendMessageData) {
        if (!data.channel) return false;

        const channel =
			this.guildMember.guild.channels.cache.get(String(data.channel)) ??
			(await this.guildMember.guild.client.channels.fetch(
			    String(data.channel),
			    { cache: true }
			).catch(() => null));

        if (!channel) return false;

        if (
            channel.type !== ChannelType.GuildText &&
			channel.type !== ChannelType.GuildAnnouncement
        )
            return false;

        if (
            !channel
                .permissionsFor(this.guildMember.client.user)
                ?.has(PermissionsBitField.Flags.SendMessages)
        )
            return false;

        const parsedMessageOptions = await this.createAndParseGreetMsg(
			<SendMessageData>data
        );

        return channel.send(parsedMessageOptions).then((m) => {
            if (data.timeout) {
                setTimeout(() => m.delete().catch(() => null), data.timeout * 1000);
                return m;
            }
            return m;
        });
    }

    public async parsePlaceHolders(input: string) {
        const lowercase = input.toLowerCase();

        for (const [key, value] of this.replacements) {
            if (lowercase.includes(key)) {
                const regex = new RegExp(key, "ig");
                const replacement = value(this.guildMember);
                const escapedReplacement = JSON.stringify(replacement).slice(1, -1);
                input = input.replace(regex, () => escapedReplacement);
            }
        }
        return input;
    }

    static assertMessageMember(
        message: Message<true>
    ): message is MemberMessage {
        return !!message.member;
    }
}

export type IJSONToMessageOptions = MessageCreateOptions & {
	embeds?: APIEmbed[] | undefined;
};

export class JSONToMessageOptions implements MessageCreateOptions {
    embeds: EmbedBuilder[] | undefined;
    content?: string | undefined;
    stickers?: readonly StickerResolvable[] | undefined;

    constructor(any: IJSONToMessageOptions) {
        this.content = any.content;
        this.stickers = any.stickers;

        this.embeds = any.embeds
            ? any.embeds.map((e: APIEmbed) => {
                if (e.color && !Number.isInteger(e.color)) {
                    e.color = parseInt(
                        String(e.color).replace(/#/g, ""),
                        16
                    );
                }

                return EmbedBuilder.from(e);
            })
            : undefined;
    }
}
