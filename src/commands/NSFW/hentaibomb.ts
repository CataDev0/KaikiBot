import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentaibomb",
    aliases: ["hb"],
    description: "Posts 10 NSFW images from waifu.im.",
    usage: [""],
    typing: true,
    nsfw: true,
    cooldownDelay: 10000,
})
export default class HentaiBombCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
    ): Promise<Message> {
        const urls = await this.client.hentaiService.grabHentai(
            "hentai",
            "bomb"
        );

        return message.reply({
            embeds: urls.map((url) =>
                new EmbedBuilder().setImage(url).withOkColor(message)
            ),
        });
    }
}
