import { BlockedCategories, Guilds } from "@prisma/client";
import { Args, UserError } from "@sapphire/framework";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import {
    AttachmentBuilder,
    EmbedBuilder,
    Guild,
    Message,
    MessageCreateOptions,
    PermissionsBitField,
    resolveColor,
} from "discord.js";
import { imgFromColor } from "../Color";
import { CategoriesEnum } from "../Enums/categoriesEnum";
import GreetHandler from "../GreetHandler";
import KaikiUtil from "../KaikiUtil";

export default class Config {
    static async dadbotRun(message: Message<true>, args: Args) {
        Config.checkSubcommandUserPermission(
            message,
            PermissionsBitField.Flags.Administrator
        );

        const booleanArgument = await args.rest("boolean");

        const embed = new EmbedBuilder().withOkColor(message);

        const dadBotEnabled: boolean = message.client.guildsDb.get(
            message.guildId,
            "DadBot",
            false
        );

        if (booleanArgument) {
            if (dadBotEnabled) {
                embed
                    .setTitle("Already enabled")
                    .setDescription(
                        "You have already **enabled** dad-bot in this server."
                    )
                    .withErrorColor(message);
            } else {
                await message.client.guildsDb.set(
                    message.guildId,
                    "DadBot",
                    true
                );

                embed
                    .setTitle(
                        `Dad-bot has been enabled in ${message.guild?.name}!`
                    )
                    .setDescription(
                        `Individual users can still disable dad-bot on themselves with \`${await message.client.fetchPrefix(message)}exclude\`.`
                    );
            }
        } else if (dadBotEnabled) {
            await message.client.guildsDb.set(message.guildId, "DadBot", false);

            const cmd = message.guild?.commands.cache.find(
                (c) => c.name === "exclude"
            );

            if (cmd) {
                await message.guild?.commands.delete(cmd.id);
            }

            embed.setTitle(
                `Dad-bot has been disabled in ${message.guild?.name}!`
            );
        } else {
            embed
                .setTitle("Already disabled")
                .setDescription(
                    "You have already **disabled** dad-bot in this server."
                )
                .withErrorColor(message);
        }
        return message.reply({
            embeds: [embed],
        });
    }

    private static checkSubcommandUserPermission(
        message: Message,
        permission: bigint
    ) {
        if (!(message.member && message.member.permissions.has(permission))) {
            throw new UserError({
                message: `You do not have permission(s): ${new PermissionsBitField(permission).toArray()}`,
                identifier: "configSubcommandPermission",
            });
        }
    }

    static async anniversaryRun(message: Message<true>, args: Args) {
        this.checkSubcommandUserPermission(
            message,
            PermissionsBitField.Flags.Administrator
        );

        const booleanArgument = await args.rest("boolean");

        const embed = new EmbedBuilder().withOkColor(message);

        const anniversaryEnabled: boolean = message.client.guildsDb.get(
            message.guildId,
            "Anniversary",
            false
        );

        if (booleanArgument) {
            if (!anniversaryEnabled) {
                await message.client.anniversaryService.checkBirthdayOnAdd(
					message.guild as Guild
                );
                await message.client.guildsDb.set(
                    message.guildId,
                    "Anniversary",
                    true
                );
                embed.setDescription(
                    `Anniversary-roles functionality has been enabled in ${message.guild?.name}!`
                );
            } else {
                embed.setDescription(
                    "You have already enabled Anniversary-roles."
                );
            }
        } else if (anniversaryEnabled) {
            await message.client.guildsDb.set(
                message.guildId,
                "Anniversary",
                false
            );
            embed.setDescription(
                `Anniversary-roles functionality has been disabled in ${message.guild?.name}!`
            );
        } else {
            embed.setDescription(
                "You have already disabled Anniversary-roles."
            );
        }

        return message.reply({
            embeds: [embed],
        });
    }

    static async prefixRun(message: Message<true>, args: Args) {
        const value = await args.rest("string");

        if (value.length > 10) throw new UserError({
            "message": "Prefix can be no longer than 10 characters.",
            "identifier": "PrefixTooLong"
        })

        this.checkSubcommandUserPermission(
            message,
            PermissionsBitField.Flags.Administrator
        );

        const guildID = message.guild.id,
            oldPrefix = message.client.guildsDb.get(
                guildID,
                "Prefix",
                process.env.PREFIX
            );

        await message.client.guildsDb.set(guildID, "Prefix", value);

        return message.reply({
            embeds: [
                new EmbedBuilder({
                    title: "Prefix changed!",
                    description: `Prefix has been set to \`${value}\` !`,
                    footer: { text: `Old prefix: \`${oldPrefix}\`` },
                }).withOkColor(message),
            ],
        });
    }

    static async okcolorRun(message: Message<true>, args: Args) {
        const color = await args.rest("kaikiColor");

        const intValue = resolveColor([color.r, color.g, color.b]);

        const hex = KaikiUtil.convertRGBToHex(color);

        await message.client.guildsDb.set(message.guildId, "OkColor", intValue);

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Success!")
                    .setDescription(
                        `OkColor has been set to ${hex} [\`${intValue}\`]`
                    )
                    .withOkColor(message),
            ],
        });
    }

    static async errorcolorRun(message: Message<true>, args: Args) {
        const color = await args.rest("kaikiColor");

        const intValue = resolveColor([color.r, color.g, color.b]);

        const hex = KaikiUtil.convertRGBToHex(color);

        await message.client.guildsDb.set(
            message.guildId,
            "ErrorColor",
            intValue
        );

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Success!")
                    .setDescription(
                        `ErrorColor has been set to ${hex} [\`${intValue}\`]`
                    )
                    .withErrorColor(message),
            ],
        });
    }

    static async messageRun(message: Message<true>) {
        if (!message.member) throw new Error();

        let db = await message.client.orm.guilds.findUnique({
            where: { Id: BigInt(message.guildId) },
            include: { BlockedCategories: true },
        });

        if (!db) {
            const g = await message.client.db.getOrCreateGuild(
                BigInt(message.guildId)
            );
            const blockedCategoriesObj: {
				BlockedCategories: BlockedCategories[];
			} = { BlockedCategories: [] };
            Object.assign(g, blockedCategoriesObj);
            db = g as Guilds & { BlockedCategories: BlockedCategories[] };
        }

        // Is this okay?
        const {
            Anniversary,
            DadBot,
            Prefix,
            ErrorColor,
            OkColor,
            WelcomeChannel,
            ByeChannel,
        } = db;

        const categories = db.BlockedCategories.map(
            (e) => CategoriesEnum[e.CategoryTarget]
        ).filter(Boolean);

        const base = new EmbedBuilder().withOkColor(message).data;

        const realOkColor = KaikiUtil.convertHexToRGB(OkColor.toString(16));
        const realErrorColor = KaikiUtil.convertHexToRGB(
            ErrorColor.toString(16)
        );

        const okColorAttachment = new AttachmentBuilder(
            await imgFromColor(realOkColor),
            { name: "okColorImg.jpg" }
        );
        const errorColorAttachment = new AttachmentBuilder(
            await imgFromColor(realErrorColor),
            { name: "errorColorImg.jpg" }
        );

        const hexOkColor = KaikiUtil.convertRGBToHex(realOkColor);
        const hexErrorColor = KaikiUtil.convertRGBToHex(realErrorColor);

        const firstPage: MessageCreateOptions = {
            content: undefined,
            components: [],
            files: [okColorAttachment, errorColorAttachment],
            embeds: [
                new EmbedBuilder(base).addFields([
                    {
                        name: "Dad-bot",
                        value: KaikiUtil.toggledTernary(DadBot),
                        inline: true,
                    },
                    {
                        name: "Anniversary-Roles",
                        value: KaikiUtil.toggledTernary(Anniversary),
                        inline: true,
                    },
                    {
                        name: "Guild prefix",
                        value:
							Prefix === process.env.PREFIX
							    ? `\`${process.env.PREFIX}\` (Default)`
							    : `\`${Prefix}\``,
                        inline: true,
                    },
                    {
                        name: "Welcome message",
                        value: KaikiUtil.toggledTernary(!!WelcomeChannel),
                        inline: true,
                    },
                    {
                        name: "Goodbye message",
                        value: KaikiUtil.toggledTernary(!!ByeChannel),
                        inline: true,
                    },
                    {
                        name: "Sticky roles",
                        value: KaikiUtil.toggledTernary(
                            await message.client.guildsDb.get(
                                message.guildId,
                                "StickyRoles",
                                false
                            )
                        ),
                        inline: true,
                    },
                ]).data,
                new EmbedBuilder(base)
                    .setImage("attachment://okColorImg.jpg")
                    .setFields({
                        name: "Embed ok color",
                        value: hexOkColor,
                        inline: true,
                    })
                    .setColor(hexOkColor),
                new EmbedBuilder(base)
                    .setImage("attachment://errorColorImg.jpg")
                    .setFields({
                        name: "Embed error color",
                        value: hexErrorColor,
                        inline: true,
                    })
                    .setColor(hexErrorColor),
            ],
        };

        if (categories.length && firstPage.embeds) {
            firstPage.embeds = [
                EmbedBuilder.from(firstPage.embeds[0]).addFields([
                    {
                        name: "Disabled categories",
                        value: categories.join("\n"),
                        inline: false,
                    },
                ]),
            ];
        }

        const pages: MessageCreateOptions[] = [firstPage];

        const greetHandler = new GreetHandler(message.member);

        if (db.WelcomeMessage) {
            pages.push(
                await greetHandler.createAndParseGreetMsg({
                    message: db.WelcomeMessage || null,
                    channel: db.WelcomeChannel,
                    timeout: db.WelcomeTimeout,
                })
            );
        }

        if (db.ByeMessage) {
            pages.push(
                await greetHandler.createAndParseGreetMsg({
                    message: db.ByeMessage || null,
                    channel: db.ByeChannel,
                    timeout: db.ByeTimeout,
                })
            );
        }
        return sendPaginatedMessage(message, pages, { owner: message.author });
    }
}
