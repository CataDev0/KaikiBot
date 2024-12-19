import { createDjsClient } from "discordbotlist-djs";
import process from "process";
import { EmbedBuilder } from "discord.js";
import Constants from "../struct/Constants";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";

export default class DiscordBotListService {
    constructor(client: KaikiSapphireClient<true>) {
        const dblClient = createDjsClient(process.env.DBL_API_TOKEN!, client);

        dblClient.startPosting();
        dblClient.startPolling();

        dblClient.on("vote", async (vote) => {
            const amount = client.botSettings.get("1", "DailyAmount", 250);
            await Promise.all([
                client.users.cache
                    .get(vote.id)
                    ?.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Thank you for your support! 🎉")
                                .setDescription(
                                    `You received ${amount} ${client.money.currencyName} ${client.money.currencySymbol}`
                                )
                                .setFooter({
                                    text: "🧡",
                                })
                                .setColor(Constants.kaikiOrange),
                        ],
                    })
                    // Ignore failed DMs
                    .catch(() => undefined),
                client.money.add(
                    vote.id,
                    BigInt(amount),
                    "Voted - DiscordBotList"
                ),
            ]);
        });

    }
}
