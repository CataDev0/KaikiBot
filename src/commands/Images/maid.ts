import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { EndPointSignatures } from "../../lib/APIs/WaifuCataMoe";

@ApplyOptions<KaikiCommandOptions>({
    name: "maid",
    description: "Returns anime maids.",
    usage: [""],
    typing: true,
})
export default class Maid extends KaikiCommand {
    public async messageRun(message: Message) {
        return this.client.imageAPIs.WaifuCataMoe.sendImageAPIRequest(
            message,
            EndPointSignatures.Maid
        );
    }
}
