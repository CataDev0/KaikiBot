import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import {
    Attachment,
    AttachmentBuilder,
    EmbedBuilder,
    Message,
    User,
} from "discord.js";

import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

import KaikiArgumentsTypes from "../../lib/Kaiki/KaikiArgumentsTypes";

@ApplyOptions<KaikiCommandOptions>({
    name: "compress",
    description: "Compresses given member's avatar...",
    usage: ["@dreb"],
    preconditions: ["GuildOnly"],
    minorCategory: "Image Manipulation",
})
export default class CompressCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        const url = await KaikiArgumentsTypes.checkImageArgument(message, args);

        const imageBuffer = await (await fetch(url)).arrayBuffer();

        if (imageBuffer.byteLength > Constants.MAGIC_NUMBERS.CMDS.FUN.COMPRESS.MAX_FILE_SIZE) {
            throw new UserError({
                identifier: "FileTooLarge",
                message: `Image must be under ${Constants.MAGIC_NUMBERS.CMDS.FUN.COMPRESS.MAX_FILE_SIZE / 1024 / 1024} MB.`,
            });
        }

        const { width = 0, height = 0 } = await sharp(imageBuffer).metadata();
        if (width > Constants.MAGIC_NUMBERS.CMDS.FUN.COMPRESS.MAX_DIMENSION || height > Constants.MAGIC_NUMBERS.CMDS.FUN.COMPRESS.MAX_DIMENSION) {
            throw new UserError({
                identifier: "ImageTooLarge",
                message: `Image dimensions must not exceed ${Constants.MAGIC_NUMBERS.CMDS.FUN.COMPRESS.MAX_DIMENSION}px.`,
            });
        }

        const downscaledBuffer = await sharp(imageBuffer)
            .resize({ height: 64, kernel: "nearest", fit: "outside" })
            .webp({ quality: 50 })
            .toBuffer();

        const pictureBuffer = await sharp(downscaledBuffer)
            .resize({ height: 256, kernel: "nearest", fit: "outside" })
            .webp({ quality: 100 })
            .toBuffer();

        const attachment = new AttachmentBuilder(pictureBuffer, {
            name: "compressed.webp",
        });

        const embed = new EmbedBuilder({
            title: "High quality image...",
            image: { url: "attachment://compressed.webp" },
        }).withOkColor(message);

        return message.reply({ files: [attachment], embeds: [embed] });
    }
}
