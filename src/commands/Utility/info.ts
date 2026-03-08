import { time } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, EmojiObject, UserError } from "@sapphire/framework";
import {
    CategoryChannel,
    ChannelType,
    Collection,
    EmbedBuilder,
    GuildChannel,
    GuildMember,
    Message,
    Role,
    Sticker,
    StickerType,
    TextChannel,
    ThreadChannel,
    User,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "info",
    description: "Returns info on a channel, role, member, emoji, or message",
    usage: ["#channel", "@member", "@role", ":coolCustomEmoji:", "messageID"],
    preconditions: ["GuildOnly"],
    typing: true,
    minorCategory: "Info",
})
export default class InfoCommand extends KaikiCommand {
    private readonly NoArgumentFoundError = new UserError({
        identifier: "NoArgumentFound",
        message:
			"I couldn't find any relevant information for the argument you provided. Please check your input and try again.",
    });

    public async messageRun(message: Message<true>, args: Args) {
        const obj = await this.resolveTarget(message, args);

        let emb: EmbedBuilder[] = [];

        if (obj instanceof GuildChannel || obj instanceof ThreadChannel) {
            emb = await this.gChannel(message, obj);
        } else if (obj instanceof GuildMember || obj instanceof User) {
            emb = await this.gMember(message, obj);
        } else if (obj instanceof Role) {
            emb = await this.gRole(message, obj);
        } else if (obj instanceof Message) {
            emb = await this.gMessage(message, obj);
        } else if (obj instanceof Collection) {
            emb = await this.sticker(message, obj);
        } else if (this.isEmojiObject(obj)) {
            emb = await this.emoji(message, obj);
        } else {
            throw this.NoArgumentFoundError;
        }

        return message.reply({ embeds: emb });
    }

    private async resolveTarget(message: Message<true>, args: Args) {
        if (args.finished) {
            if (message.stickers.size) return message.stickers;
            return message.member || message.author;
        }

        const strategies = [
            () => args.pick("member"),
            () => args.pick("user"),
            () => args.pick("guildChannel"),
            () => args.pick("role"),
            () => args.pick("message"),
            () => args.pick("emoji"),
        ];

        for (const strategy of strategies) {
            try {
                return await strategy();
            } catch {
                continue;
            }
        }

        throw this.NoArgumentFoundError;
    }

    private async gMember(message: Message<true>, obj: GuildMember | User) {
        // Base embed
        const emb = [new EmbedBuilder().withOkColor(message)];

        const isMember = "user" in obj;

        const user = isMember ? obj.user : obj;

        emb[0]
            .setTitle(`Info about user: ${user.username}`)
            .setThumbnail(user.displayAvatarURL())
            .addFields([
                { name: "ID", value: obj.id, inline: true },
                {
                    name: "Joined Discord",
                    value: time(user.createdAt),
                    inline: true,
                },
            ]);

        const uFlags = user.flags?.toArray();

        if (uFlags?.length) {
            emb[0].addFields([
                {
                    name: "Flags",
                    value: uFlags
                        .map((flag) => Constants.flags[flag])
                        .join("\n"),
                    inline: true,
                },
            ]);
        }

        if (user.bot)
            emb[0].addFields({ name: "Bot", value: "✅", inline: true });

        if (user.banner || (await user.fetch(true)).banner) {
            emb[0].setImage(user.bannerURL({ size: 4096 }) || null);
        }

        if (isMember) {
            const presence = KaikiUtil.getMemberPresence(obj);

            emb[0].addFields(
                {
                    name: "Joined Server",
                    value: obj.joinedAt ? time(obj.joinedAt) : "N/A",
                    inline: true,
                },
                {
                    name: "Roles",
                    value: String(obj.roles.cache.size),
                    inline: true,
                },
                {
                    name: "Highest role",
                    value: String(obj.roles.highest),
                    inline: true,
                }
            );

            if (presence) {
                emb[1] = new EmbedBuilder()
                    .withOkColor(message)
                    .setTitle(presence.type)
                    .setDescription(
                        [
                            presence.name,
                            presence.state,
                            presence.value.large,
                            presence.value.small,
                            presence.value.details,
                        ]
                            .filter(Boolean)
                            .join("\n")
                    );

                if (presence.image) {
                    emb[1].setImage(presence.image);
                }

                if (presence.emoji) {
                    emb[1].setThumbnail(presence.emoji);
                }
            }
        }

        return emb;
    }

    private async gChannel(
        message: Message<true>,
        obj: GuildChannel | ThreadChannel
    ) {
        const emb = [
            new EmbedBuilder()
                .withOkColor(message)
                .setTitle(`Info about ${this.getChannelTypeName(obj)}: ${obj.name}`)
                .addFields(
                    { name: "ID", value: obj.id, inline: true },
                    {
                        name: "Type",
                        value: Constants.channelTypes[
                                ChannelType[obj.type] as keyof typeof ChannelType
                        ],
                        inline: true,
                    },
                    {
                        name: "Created at",
                        value: obj.createdAt ? time(obj.createdAt) : "N/A",
                        inline: true,
                    },
                    { name: "Link", value: obj.url, inline: true }
                ),
        ];

        if (obj.parent) {
            emb[0].addFields({
                name: "Parent",
                value: `${obj.parent.name} [${obj.parentId}]`,
                inline: true,
            });
        }

        if (obj.isVoiceBased()) {
            emb[0].addFields(
                {
                    name: "Bitrate",
                    value: `${obj.bitrate / 1000}kbps`,
                    inline: true,
                },
                {
                    name: "User limit",
                    value: obj.userLimit === 0 ? "No limit" : String(obj.userLimit),
                    inline: true,
                }
            );
        }

        if (obj.isTextBased()) {
            if (obj.isThread()) {
                if (obj.ownerId) {
                    const owner = message.guild.members.cache.get(obj.ownerId);
                    emb[0].addFields({
                        name: "Author",
                        value: owner ? owner.user.username : obj.ownerId,
                        inline: true,
                    });
                }
            } else if ("nsfw" in obj) {
                emb[0].addFields({
                    name: "NSFW",
                    value: obj.nsfw ? "Enabled" : "Disabled",
                    inline: true,
                });
            }
        }

        if (obj instanceof CategoryChannel) {
            emb[0].addFields({
                name: "Children",
                value: String(obj.children.cache.size),
                inline: true,
            });
        }

        return emb;
    }

    private getChannelTypeName(obj: GuildChannel | ThreadChannel): string {
        if (obj.isVoiceBased()) return "voice channel";
        if (obj.isThread()) return "thread";
        if (obj instanceof CategoryChannel) return "category";
        return "text channel";
    }

    private async gRole(message: Message<true>, obj: Role) {
        return [
            new EmbedBuilder()
                .withOkColor(message)
                .setTitle(`Info about role: ${obj.name}`)
                .addFields(
                    { name: "ID", value: obj.id, inline: true },
                    { name: "Created at", value: time(obj.createdAt), inline: true },
                    { name: "Color", value: obj.hexColor, inline: true },
                    { name: "Members", value: String(obj.members.size), inline: true },
                    {
                        name: "Mentionable",
                        value: String(obj.mentionable),
                        inline: true,
                    },
                    { name: "Hoisted", value: String(obj.hoist), inline: true },
                    { name: "Position", value: String(obj.position), inline: true }
                ),
        ];
    }

    private async gMessage(message: Message<true>, obj: Message<boolean>) {
        return [
            new EmbedBuilder()
                .withOkColor(message)
                .setTitle(
                    `Info about message in channel: ${(obj.channel as TextChannel).name}`
                )
                .addFields(
                    { name: "ID", value: obj.id, inline: true },
                    { name: "Created at", value: time(obj.createdAt), inline: false },
                    { name: "Author", value: obj.author.username, inline: true },
                    { name: "Link", value: obj.url, inline: true }
                ),
        ];
    }

    private async emoji(message: Message<true>, obj: EmojiObject) {
        const id = obj.id!;
        const link = `https://cdn.discordapp.com/emojis/${id}.${obj.animated ? "gif" : "png"}`;

        return [
            new EmbedBuilder()
                .withOkColor(message)
                .setTitle("Info about custom emoji")
                .setImage(link)
                .addFields(
                    { name: "Name", value: obj.name || "N/A", inline: true },
                    { name: "ID", value: id || "N/A", inline: true },
                    { name: "Raw", value: `\`:${obj.name}:\``, inline: true },
                    { name: "Link", value: link, inline: true }
                ),
        ];
    }

    private async sticker(
        message: Message<true>,
        obj: Collection<string, Sticker>
    ) {
        return obj.map((sticker) =>
            new EmbedBuilder()
                .setTitle(`Info about Sticker: ${sticker.name}`)
                .setImage(sticker.url)
                .addFields(
                    { name: "ID", value: sticker.id, inline: true },
                    { name: "Tags", value: sticker.tags || "N/A", inline: true },
                    {
                        name: "Description",
                        value: sticker.description || "N/A",
                        inline: true,
                    },
                    {
                        name: "Type",
                        value:
                            sticker.type === StickerType.Standard ? "Official" : "Guild",
                        inline: true,
                    }
                )
                .withOkColor(message)
        );
    }

    private isEmojiObject(obj: unknown): obj is EmojiObject {
        return !!(obj as EmojiObject)?.name && !!(obj as EmojiObject)?.id;
    }
}
