import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentai",
    description: "Fetches a hentai image from waifu.im.",
    usage: [""],
    typing: true,
    nsfw: true,
    cooldownDelay: 3000,
})
export default class HentaiCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
    ): Promise<Message> {
        const url = await this.client.hentaiService.grabHentai(
            "hentai",
            "single"
        );

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setImage(url)
                    .setFooter({ text: "hentai" })
                    .withOkColor(message),
            ],
        });
    }
}
