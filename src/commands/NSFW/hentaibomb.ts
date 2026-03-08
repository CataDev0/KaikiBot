import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import HentaiService from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentaibomb",
    aliases: ["hb"],
    description: "Posts 5 NSFW images from waifu.pics. Optionally specify a category.",
    usage: ["waifu", "neko", "femboy", "blowjob"],
    typing: true,
    nsfw: true,
    cooldownDelay: 10000,
})
export default class HentaiBombCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
        args: Args
    ): Promise<Message> {
        const category = await args.pick("kaikiHentai").catch(() => {
            if (args.finished) {
                return null;
            }
            throw new UserError({
                identifier: "NoCategoryProvided",
                message: "Couldn't find a category with that name.",
            });
        });

        const chosenCategory =
            category ??
            HentaiService.hentaiArray[
                Math.floor(Math.random() * HentaiService.hentaiArray.length)
            ];

        const urls = await this.client.hentaiService.grabHentai(
            chosenCategory,
            "bomb"
        );

        return message.reply({
            embeds: urls.map((url) =>
                new EmbedBuilder().setImage(url).withOkColor(message)
            ),
        });
    }
}
