import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import {
    Attachment,
    AttachmentBuilder,
    EmbedBuilder,
    GuildMember,
    Message,
    User,
} from "discord.js";

import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "compress",
    description: "Compresses given member's avatar...",
    usage: ["@dreb"],
    preconditions: ["GuildOnly"],
})
export default class CompressCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        const argument = await args.pick("user")
            .catch(() => args.pick("url"))
            .catch(() => {
                const attachment = message.attachments.first();
                // Returns the first attachemnt if it is an image
                if (attachment?.contentType?.startsWith("image/")) {
                    return attachment;
                }

                // Return member as default for no arguments
                if (args.finished) {
                    return message.author;
                }

                // Finally if args were given, throw when none found
                throw new UserError({
                    identifier: "Argument",
                    message: "Please provide a member, image-url or attached image.",
                });
            });

        let image: Response;

        if (argument instanceof User) {
            image = await fetch(argument.displayAvatarURL({
                size: 32,
                extension: "jpg",
            }));
        }
        else if (argument instanceof URL) {
            image = await fetch(argument);
        }
        else {
            image = await fetch((argument as Attachment).url)
        }

        const imageBuffer = await image.arrayBuffer();

        const downscaled = sharp(imageBuffer)
            .resize({ height: 64, kernel: "nearest", fit: "outside" })
            .webp({ quality: 50 });

        const picture = sharp(await downscaled.toBuffer())
            .resize({ height: 256, kernel: "nearest", fit: "outside" })
            .webp({ quality: 100 });

        const attachment = new AttachmentBuilder(
            await picture.toBuffer(), {
            name: "compressed.jpg",
        });

        const embed = new EmbedBuilder({
            title: "High quality image...",
            image: { url: "attachment://compressed.jpg" },
        }).withOkColor(message);

        return message.reply({ files: [attachment], embeds: [embed] });
    }
}
