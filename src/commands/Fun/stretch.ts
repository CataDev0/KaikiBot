import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import {
    Attachment,
    AttachmentBuilder,
    EmbedBuilder,
    GuildMember,
    Message,
} from "discord.js";

import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "stretch",
    description: "Stretches given member's avatar",
    usage: ["@dreb"],
})
export default class SquishCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        
        const argument = await args.pick("member")
            .catch(() => args.pick("url"))
            .catch(() => {
                const attachment = message.attachments.first();
                // Returns the first attachemnt if it is an image
                if (attachment?.contentType?.startsWith("image/")) {
                    return attachment;
                }

                // Return member as default for no arguments
                if (args.finished) {
                    return message.member!;
                }

                // Finally if args were given, throw when none found
                throw new UserError({
                    identifier: "Argument",
                    message: "Please provide a member, image-url or attached image.",
                });
            });

        let image: Response;

        if (argument instanceof GuildMember) {
            image = await fetch(argument.displayAvatarURL({
                size: 256,
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

        const picture = sharp(imageBuffer).resize(1024, 256, { fit: "fill" }).webp();

        const attachment: AttachmentBuilder = new AttachmentBuilder(
            await picture.toBuffer(),
            { name: "Stretched.jpg" }
        );
        const embed = new EmbedBuilder({
            title: "Stretched image...",
            image: { url: "attachment://Stretched.jpg" },
        }).withOkColor(message);

        return message.reply({ files: [attachment], embeds: [embed] });
    }
}
