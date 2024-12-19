import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import HentaiService from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentainuke",
    aliases: ["hn"],
    description: "Posts 30 NSFW images, using the waifu.pics API",
    usage: ["waifu", "neko", "femboy", "blowjob"],
    nsfw: true,
})
export default class HentaiNukeCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<void> {
        const category = await args.pick("kaikiHentai").catch(() => {
            if (args.finished) {
                return null;
            }
            throw new UserError({
                identifier: "NoCategoryProvided",
                message: "Couldn't find a category with that name.",
            });
        });
        const megaResponse = await this.client.hentaiService.grabHentai(
            category ??
				HentaiService.hentaiArray[
				    Math.floor(Math.random() * HentaiService.hentaiArray.length)
				],
            "bomb"
        );

        for (
            let index = 10, p = 0;
            p < megaResponse.length;
            index += 10, p += 10
        ) {
            await message.reply({
                embeds: megaResponse
                    .slice(p, index)
                    .map((link) =>
                        new EmbedBuilder().setImage(link).withOkColor(message)
                    ),
            });
        }
    }
}
