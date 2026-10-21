import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { APIs } from "../../lib/APIs/NekosBest";

@ApplyOptions<KaikiCommandOptions>({
    name: "waifu",
    description: "Spawn a waifu picture",
    usage: [""],
    typing: true,
})
export default class Waifu extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        return this.client.imageAPIs.NekosBest.sendImageAPIRequest(
            message,
            APIs.waifu
        );
    }
}
