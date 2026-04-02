import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

import KaikiArgumentsTypes from "../../lib/Kaiki/KaikiArgumentsTypes";

@ApplyOptions<KaikiCommandOptions>({
    name: "deepfry",
    aliases: ["fry"],
    description: "Deepfries the given image.",
    usage: ["@dreb", "https://example.com/image.png"],
    typing: true,
    minorCategory: "Image Manipulation",
})
export default class DeepfryCommand extends KaikiCommand {
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
        const { width = 0, height = 0 } = await image.metadata();

        if (width > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION || height > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION) {
            throw new UserError({
                identifier: "ImageTooLarge",
                message: `Image dimensions must not exceed ${Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION}px.`,
            });
        }
        
        const outBuffer = await image
            // Ensure reasonable size for processing
            .resize({ width: width > 1024 ? 1024 : undefined, fit: "inside" }) 
            .modulate({
                brightness: 1.5,
                saturation: 5,
            })
            .sharpen({
                sigma: 5,
            })
            .jpeg({ quality: 20 }) // Add jpeg artifacts and re-encode
            .toBuffer();

        const attachment = new AttachmentBuilder(outBuffer, { name: "deepfried.jpg" });
        const embed = new EmbedBuilder()
            .setTitle("Deepfried!")
            .setImage("attachment://deepfried.jpg")
            .withOkColor(message);

        return message.reply({ embeds: [embed], files: [attachment] });
    }
}
