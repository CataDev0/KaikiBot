import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { Attachment, AttachmentBuilder, EmbedBuilder, Message, User } from "discord.js";
import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

import KaikiArgumentsTypes from "../../lib/Kaiki/KaikiArgumentsTypes";

@ApplyOptions<KaikiCommandOptions>({
    name: "squish",
    description: "Squishes given member's avatar",
    usage: ["@dreb"],
    minorCategory: "Image Manipulation",
})
export default class SquishCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const url = await KaikiArgumentsTypes.checkImageArgument(message, args);

        const image = await fetch(url);

        const imageBuffer = await image.arrayBuffer();

        const picture = sharp(imageBuffer)
            .resize(64, 256, { fit: "fill" })
            .webp();

        const attachment: AttachmentBuilder = new AttachmentBuilder(
            await picture.toBuffer(),
            { name: "Squished.jpg" }
        );
        const embed = new EmbedBuilder({
            title: "Squished image...",
            image: { url: "attachment://Squished.jpg" },
        }).withOkColor(message);

        return message.reply({ files: [attachment], embeds: [embed] });
    }
}
