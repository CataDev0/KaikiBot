import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { APIs } from "../../lib/APIs/NekosBest";

@ApplyOptions<KaikiCommandOptions>({
    name: "pat",
    description: "Pat a cat! Or a guildmember...",
    usage: ["", "@dreb"],
    typing: true,
})
export default class PatCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        return this.client.imageAPIs.NekosBest.sendImageAPIRequest(
            message,
            APIs.pat,
            await args.rest("member").catch(() => null)
        );
    }
}
