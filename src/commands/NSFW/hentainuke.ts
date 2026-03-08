import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import HentaiService from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

const NUKE_AMOUNT = 30;
const BATCH_SIZE = 10;

@ApplyOptions<KaikiCommandOptions>({
    name: "hentainuke",
    aliases: ["hn"],
    description: `Posts up to ${NUKE_AMOUNT} NSFW images from waifu.pics. Optionally specify a category.`,
    usage: ["waifu", "neko", "femboy", "blowjob"],
    typing: true,
    nsfw: true,
    cooldownDelay: 60000,
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

        const chosenCategory =
            category ??
            HentaiService.hentaiArray[
                Math.floor(Math.random() * HentaiService.hentaiArray.length)
            ];

        const urls = await this.client.hentaiService.grabHentai(
            chosenCategory,
            "bomb",
            NUKE_AMOUNT
        );

        for (let offset = 0; offset < urls.length; offset += BATCH_SIZE) {
            await message.reply({
                embeds: urls
                    .slice(offset, offset + BATCH_SIZE)
                    .map((url) =>
                        new EmbedBuilder().setImage(url).withOkColor(message)
                    ),
            });
        }
    }
}
