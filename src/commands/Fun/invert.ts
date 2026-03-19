import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

import KaikiArgumentsTypes from "../../lib/Kaiki/KaikiArgumentsTypes";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "invert",
    description: "Inverts the colors of a given image/avatar.",
    usage: ["@dreb", "https://example.com/image.png"],
    typing: true,
    minorCategory: "Image Manipulation",
})
export default class InvertCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const url = await KaikiArgumentsTypes.checkImageArgument(message, args);

        const imageBuffer = await (await fetch(url)).arrayBuffer();

        if (imageBuffer.byteLength > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE) {
            throw new UserError({
                identifier: "FileTooLarge",
                message: `Image must be under ${Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE / 1024 / 1024} MB.`,
            });
        }

        const image = sharp(imageBuffer);

        const outBuffer = await image
            .png()
            .negate({ alpha: false }) // Don't invert alpha channel
            .toBuffer();

        const attachment = new AttachmentBuilder(outBuffer, { name: "inverted.png" });
        const embed = new EmbedBuilder()
            .setTitle("Inverted!")
            .setImage("attachment://inverted.png")
            .withOkColor(message);

        return message.reply({ embeds: [embed], files: [attachment] });
    }
}
