import { EmbedBuilder, Message } from "discord.js";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";


export default class DailyResetCommand extends KaikiCommand {
    constructor() {
        super("dailyreset", {
            aliases: ["dailyreset", "resetdaily"],
            description: "Resets daily claims that have been made",
            usage: "",
            ownerOnly: true,
        });
    }

    public async exec(message: Message): Promise<Message> {
        await this.client.resetDailyClaims(this.client.orm);
        return message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription("Daily claims have been reset!")
                    .withOkColor(message),
            ],
        });
    }
}
