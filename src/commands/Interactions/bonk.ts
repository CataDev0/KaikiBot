import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { APIs } from "../../lib/APIs/NekosBest";

@ApplyOptions<KaikiCommandOptions>({
    name: "bonk",
    description: "When you need to bonk some horny teens",
    usage: ["", "@dreb"],
    typing: true,
})
export default class Bonk extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        return this.client.imageAPIs.NekosBest.sendImageAPIRequest(
            message,
            APIs.bonk,
            await args.rest("member").catch(() => null)
        );
    }
}
