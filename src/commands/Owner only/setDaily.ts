import { Message, MessageEmbed } from "discord.js";
import KaikiCommand from "Kaiki/KaikiCommand";
import { getBotDocument } from "../../struct/documentMethods";
import KaikiEmbeds from "../../lib/KaikiEmbeds";

export default class SetDailyCommand extends KaikiCommand {
    constructor() {
        super("setdaily", {
            aliases: ["setdaily", "dailyset"],
            description: "Sets the daily currency allowance amount for users. Set to 0 to disable.",
            usage: "",
            ownerOnly: true,
            args: [
                {
                    id: "arg",
                    type: "integer",
                    otherwise: (msg: Message) => ({ embeds: [KaikiEmbeds.genericArgumentError(msg)] }),
                },
            ],
        });
    }

    public async exec(message: Message, { arg }: { arg: number }): Promise<Message> {

        const db = await getBotDocument();
        const isEnabled = db.settings.dailyEnabled;

        if (arg > 0) {
            db.settings.dailyAmount = arg;

            if (!isEnabled) {
                db.settings.dailyEnabled = true;
            }

            db.markModified("settings");
            await db.save();

            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setDescription(`Users will be able to claim ${arg} ${this.client.money.currencyName} ${this.client.money.currencySymbol} every day`)
                    .withOkColor(message),
                ],
            });
        }

        else if (!isEnabled) {
            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setDescription("Daily currency allowance is already disabled!")
                    .withErrorColor(message),
                ],
            });
        }

        else {

            db.settings.dailyEnabled = false;

            return message.channel.send({
                embeds: [new MessageEmbed()
                    .setDescription("Disabled daily currency allowance.")
                    .withOkColor(message),
                ],
            });
        }
    }
}
