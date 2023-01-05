import { Message } from "discord.js";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

export default class megumin extends KaikiCommand {
    constructor() {
        super("megumin", {
            aliases: ["megumin"],
            description: "Spawn a shinobu picture",
            usage: [""],
            typing: true,
        });
    }

    public async exec(message: Message): Promise<Message> {
        return this.client.imageAPIs.WaifuPics.sendImageAPIRequest(message, "megumin");
    }
}
