import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { imgFromColor } from "../../lib/Color";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import { ColorNames } from "../../lib/Types/KaikiColor";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "color",
    aliases: ["clr"],
    description:
		"Returns up to 10 representations the inputted color, or shows list of available color names to use.",
    usage: ["#ff00ff #dc143c", "--list"],
    typing: true,
    flags: ["list"],
    minorCategory: "Color",
})
export default class ColorCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        const list = args.getFlags("list");

        if (list) {
            const colorList = Object.keys(Constants.hexColorTable);
            const randomColor =
                Constants.hexColorTable[
                    colorList[
                        Math.floor(Math.random() * colorList.length)
                    ] as keyof ColorNames
                ];
            const pages: EmbedBuilder[] = [];
            const FILES_PER_PAGE =
                Constants.MAGIC_NUMBERS.CMDS.UTILITY.COLOR.CLR_NAMES_PR_PAGE;

            for (let i = 0; i < colorList.length; i += FILES_PER_PAGE) {
                pages.push(
                    new EmbedBuilder({
                        title: "List of all available color names",
                        description: colorList
                            .slice(i, i + FILES_PER_PAGE)
                            .join("\n"),
                        color: Number(randomColor),
                        footer: {
                            text: `Try ${await this.client.fetchPrefix(message)}colorlist for a visual representation of the color list`,
                        },
                    })
                );
            }

            return sendPaginatedMessage(message, pages, {});
        }

        const colorArray = await args.repeat("kaikiColor", { times: 10 });

        if (!colorArray.length) {
            throw new UserError({
                identifier: "NoColors",
                message:
                    "Please provide valid colors. Usage: `color #ff0000` or `color --list`",
            });
        }

        const results = await Promise.all(
            colorArray.map(async (color, index) => {
                const attachmentName = `${index}color.jpg`;
                const hex = KaikiUtil.convertRGBToHex(color);
                const colorInteger = (color.r << 16) | (color.g << 8) | color.b;
                const name = Object.entries(Constants.hexColorTable).find(
                    ([, h]) => h === hex
                )?.[0];
                const colorString = `Hex: **${hex}** [${colorInteger}]\nRed: **${color.r}**\nGreen: **${color.g}**\nBlue: **${color.b}**`;

                const attachment = new AttachmentBuilder(
                    await imgFromColor(color),
                    {
                        name: attachmentName,
                    }
                );

                const embed = new EmbedBuilder({
                    description: colorString,
                    color: colorInteger,
                    image: {
                        url: `attachment://${attachmentName}`,
                    },
                });

                if (name) embed.setTitle(name);

                return { attachment, embed };
            })
        );

        return message.reply({
            files: results.map((r) => r.attachment),
            embeds: results.map((r) => r.embed),
        });
    }
}
