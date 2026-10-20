import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { EndPointSignatures } from "../../lib/APIs/CataWaifu";

@ApplyOptions<KaikiCommandOptions>({
    name: "selfies",
    aliases: ["selfie"],
    description: "Returns anime girl selfies",
    usage: [""],
    typing: true,
})
export default class Selfies extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        return this.client.imageAPIs.CataWaifu.sendImageAPIRequest(
            message,
            EndPointSignatures.Selfies
        );
    }
}
