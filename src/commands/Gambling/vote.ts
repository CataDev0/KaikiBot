import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import process from "process";

@ApplyOptions<KaikiCommandOptions>({
    name: "vote",
    usage: "",
    description: "Vote for me on DiscordBotList, receive a currency reward!",
})
export default class Cash extends KaikiCommand {
    public async messageRun(msg: Message) {
        if (!process.env.DBL_PAGE_URL) return;
        const amount = this.client.botSettings.get("1", "DailyAmount", 250);

        return msg.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Vote here")
                    .setDescription(
                        `Voting will award you ${amount} ${this.client.money.currencyName} ${this.client.money.currencySymbol}`
                    )
                    .setURL(process.env.DBL_PAGE_URL)
                    .withOkColor(msg),
            ],
        });
    }
}
