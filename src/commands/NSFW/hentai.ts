import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { Message } from "discord.js";
import HentaiService from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentai",
    description: "Fetches hentai images from Booru boards",
    usage: ["", "waifu", "neko", "femboy", "blowjob"],
    typing: true,
    nsfw: true,
})
export default class HentaiCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
        args: Args
    ): Promise<void | Message> {
        const category = await args.pick("kaikiHentai").catch(() => {
            if (args.finished) {
                return null;
            }
            throw new UserError({
                identifier: "NoCategoryProvided",
                message: "Couldn't find a category with that name.",
            });
        });

        return message.reply(
            await this.client.hentaiService.grabHentai(
                category ||
					HentaiService.hentaiArray[
					    Math.floor(
					        Math.random() * HentaiService.hentaiArray.length
					    )
					],
                "single"
            )
        );
    }
}
