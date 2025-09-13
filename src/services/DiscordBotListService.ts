import process from "process";
import { EmbedBuilder } from "discord.js";
import Constants from "../struct/Constants";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";
import { VoteBody } from "src/lib/Types/DiscordBotList";

export default class DiscordBotListService {
    private client: KaikiSapphireClient<true>;
    private BASE_URL = "https://discordbotlist.com/api/v1";
    private _post: NodeJS.Timeout | null;
    private DBL_API_TOKEN: string;


    constructor(client: KaikiSapphireClient<true>, DBL_API_TOKEN: string) {
        this.DBL_API_TOKEN = DBL_API_TOKEN;
        this.client = client;
    }

    public async registerVote(vote: VoteBody): Promise<void> {
        const amount = this.client.botSettings.get("1", "DailyAmount", 250);
        await Promise.all([
            this.client.users.cache
                .get(vote.id)
                ?.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Thank you for your support! 🎉")
                            .setDescription(
                                `You received ${amount} ${this.client.money.currencyName} ${this.client.money.currencySymbol}`
                            )
                            .setFooter({
                                text: "For voting at DiscordBotList 🧡",
                            })
                            .setColor(Constants.kaikiOrange),
                    ],
                })
                // Ignore failed DMs
                .catch(() => undefined),
            this.client.money.add(
                vote.id,
                BigInt(amount),
                "Voted - DiscordBotList"
            ),
        ]);
    }

    // Post bot stats to be displayed on the website.
    private async postBotStats(): Promise<void> {
        const stats = this.client.getBotStats();

        const res = await fetch(`${this.BASE_URL}/bots/${this.client.user.id}/stats`, {
            body: JSON.stringify(stats),
            headers: new Headers({
                Authorization: this.DBL_API_TOKEN,
                "Content-Type": "application/json",
            }),
            method: "POST",
        });
        if (!res.ok) throw new Error(res.statusText, { "cause": res });
    }

    // Stops this client from posting stats to DBL.
    public stopPosting() {
        if (this._post) {
            clearInterval(this._post);
            this._post = null;
        }
    }

    // Starts posting stats to DBL with the specified interval.
    public startPosting(interval = 3600000) {
        this.stopPosting();
        this.postBotStats().catch(() => null);
        this._post = setInterval(() => this.postBotStats().catch(() => null), interval).unref();
    }
}

