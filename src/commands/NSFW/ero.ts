import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { EndPointSignatures } from "../../lib/APIs/CataWaifu";

@ApplyOptions<KaikiCommandOptions>({
    name: "ero",
    description: "Returns a random NSFW ero picture from waifu.im",
    usage: [""],
    typing: true,
    nsfw: true,
    cooldownDelay: 3000,
})
export default class Ero extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        return this.client.imageAPIs.CataWaifu.sendImageAPIRequest(
            message,
            EndPointSignatures.Ero,
            undefined,
            true
        );
    }
}
