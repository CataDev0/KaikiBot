import { Message, MessageEmbed, User } from "discord.js";
import { KaikiCommand } from "kaiki";


export default class give extends KaikiCommand {
    constructor() {
        super("give", {
            aliases: ["give"],
            description: "Gives money to another user",
            usage: "50 @Cata",
            args: [
                {
                    id: "amount",
                    type: "integer",
                    otherwise: (m: Message) => ({
                        embeds: [new MessageEmbed({
                            title: "Invalid amount. It must be a number",
                        })
                            .withOkColor(m)],
                    }),
                },
                {
                    id: "user",
                    type: "user",
                    otherwise: (m: Message) => ({
                        embeds: [new MessageEmbed({
                            title: "Can't find this user. Try again.",
                        })
                            .withOkColor(m)],
                    }),
                },
            ],
        });
    }

    public async exec(msg: Message, { amount, user }: { amount: number, user: User }): Promise<void> {
        if (user.id === msg.author.id) {
            await msg.channel.send(`You can't give yourself ${this.client.money.currencySymbol}`);
            return;
        }

        const success = await this.client.money.TryTake(msg.author.id, amount);
        if (!success) {
            await msg.channel.send({
                embeds: [new MessageEmbed()
                    .setDescription(`You don't have enough ${this.client.money.currencySymbol}`)
                    .withErrorColor(msg)],
            });
            return;
        }

        await this.client.money.Add(user.id, amount);
        await msg.channel.send({
            embeds: [new MessageEmbed()
                .setDescription(`You've given ${amount} ${this.client.money.currencySymbol} to ${user.username}`)
                .withOkColor(msg)],
        });
    }
}
