import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { Message } from "discord.js";
import HentaiService from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "hentaibomb",
    aliases: ["hb"],
    description: "Posts 5 NSFW images, using the waifu.pics API",
    usage: ["waifu", "neko", "femboy", "blowjob"],
    nsfw: true,
})
export default class HentaiBombCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
        args: Args
    ): Promise<Message | Message[]> {
        const category = await args.pick("kaikiHentai").catch(() => {
            if (args.finished) {
                return null;
            }
            throw new UserError({
                identifier: "NoCategoryProvided",
                message: "Couldn't find a category with that name.",
            });
        });

        const megaResponse = (
            await this.client.hentaiService.grabHentai(
                category ??
					HentaiService.hentaiArray[
					    Math.floor(
					        Math.random() * HentaiService.hentaiArray.length
					    )
					],
                "bomb"
            )
        ).splice(0, 5);

        return message.reply({ content: megaResponse.join("\n") });
    }
}
