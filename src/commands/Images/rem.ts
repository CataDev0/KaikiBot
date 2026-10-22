import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { EndPointSignatures } from "../../lib/APIs/WaifuCataMoe";

@ApplyOptions<KaikiCommandOptions>({
    name: "rem",
    description: "Returns Rem pictures.",
    usage: [""],
    typing: true,
})
export default class Rem extends KaikiCommand {
    public async messageRun(message: Message) {
        return this.client.imageAPIs.WaifuCataMoe.sendImageAPIRequest(
            message,
            EndPointSignatures.Rem
        );
    }
}
