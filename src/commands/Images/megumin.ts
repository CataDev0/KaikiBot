import { ApplyOptions } from "@sapphire/decorators";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { APIs } from "../../lib/APIs/WaifuPics";

@ApplyOptions<KaikiCommandOptions>({
    name: "megumin",
    description: "Spawn a shinobu picture",
    usage: [""],
    typing: true,
    enabled: false, // Disabled until we can find a better source than waifu.pics
})
export default class megumin extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        return this.client.imageAPIs.WaifuPics.sendImageAPIRequest(
            message,
            APIs.megumin
        );
    }
}
