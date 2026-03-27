import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "setbanner",
    aliases: ["setbanner"],
    description: "Assigns the bot a new banner.",
    usage: [
        "https://discord.com/media/1231231231231312321/1231231312323132.png",
    ],
    preconditions: ["OwnerOnly"],
})
export default class SetBannerCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const url = await args.rest("url");

        if (!url.href.match(Constants.imgExtensionsRegex)?.length)
            throw new Error(
                "Unsupported image type. Please provide a PNG, JPEG or GIF link."
            );

        const img = await KaikiUtil.loadImage(url.href);

        const imgBuffer = Buffer.from(img);

        await fetch("https://discord.com/api/v9/users/@me", {
            method: "PATCH",
            headers: {
                Authorization: `Bot ${this.client.token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                banner: `data:image/gif;base64,${imgBuffer.toString("base64")}`,
            }),
        });

        const attachment = new AttachmentBuilder(imgBuffer, {
            name:
				"bannerFile" +
				url.pathname.substring(url.pathname.lastIndexOf(".")),
        });

        return message.reply({
            content: "New banner set.",
            embeds: [
                new EmbedBuilder()
                    .setImage(`attachment://${attachment.name}`)
                    .withOkColor(message),
            ],
            files: [attachment],
        });
    }
}
