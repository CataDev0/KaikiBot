import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { EndPointSignatures } from "../../lib/APIs/WaifuCataMoe";

@ApplyOptions<KaikiCommandOptions>({
    name: "marin",
    description: "Returns an image of Marin Kitagawa",
    usage: [""],
    typing: true,
    enabled: true,
})
export default class Marin extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        return this.client.imageAPIs.WaifuCataMoe.sendImageAPIRequest(
            message,
            EndPointSignatures.MarinKitagawa
        );
    }
}
