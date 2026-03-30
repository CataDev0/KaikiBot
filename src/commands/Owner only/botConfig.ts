import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { container } from "@sapphire/pieces";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { EmbedBuilder, Message } from "discord.js";
import { KaikiSubCommandOptions } from "../../lib/Interfaces/Kaiki/KaikiSubCommandOptions";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";
import { BotConfig } from "../../struct/db/Database";

@ApplyOptions<KaikiSubCommandOptions>({
    name: "botconfig",
    aliases: ["bc"],
    description:
		"Change various bot configurations. Run without arguments to see current settings.",
    usage: ["<setting> <value>", "currencyname Europe Dollars"],
    preconditions: ["OwnerOnly"],
    subcommands: [
        {
            name: "show",
            messageRun: "showRun",
            default: true,
        },
        {
            name: "activity",
            messageRun: "activityRun",
        },
        {
            name: "activitytype",
            messageRun: "activitytypeRun",
        },
        {
            name: "currencyname",
            messageRun: "currencynameRun",
        },
        {
            name: "currencysymbol",
            messageRun: "currencysymbolRun",
        },
        {
            name: "dailyEnabled",
            messageRun: "dailyEnabledRun",
        },
        {
            name: "dailyAmount",
            messageRun: "dailyAmountRun",
        },
    ],
})
export default class BotConfigCommand extends Subcommand {
    private client = container.client;

    public async showRun(message: Message) {
        const settings = await this.client.orm.$queryRawUnsafe<any[]>("SELECT * FROM BotSettings");
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .addFields([
                        {
                            name: "Bot config",
                            value: await KaikiUtil.codeblock(
                                JSON.stringify(
                                    new BotConfig(settings[0]),
                                    null,
                                    4
                                ),
                                "json"
                            ),
                        },
                    ])
                    .withOkColor(message),
            ],
        });
    }

    public async activityRun(message: Message, args: Args) {
        const name = await args.rest("string");
        const oldActivity = this.client.botSettings.get("1", "Activity", null);

        message.client.user.setActivity({ name });
        await this.client.botSettings.set("1", "Activity", name);

        return BotConfigCommand.sendEmbed(message, oldActivity, name);
    }

    public async activitytypeRun(message: Message, args: Args) {
        const type = await args.pick("activityType");
        const activity = this.client.botSettings.get("1", "Activity", null);
        const oldActivityType = this.client.botSettings.get(
            "1",
            "ActivityType",
            null
        );

        if (activity) {
            message.client.user.setActivity({
                type: Constants.activityTypes[type],
                name: activity,
            });
        }

        await this.client.botSettings.set("1", "ActivityType", type);

        return BotConfigCommand.sendEmbed(message, oldActivityType, type);
    }

    public async currencynameRun(message: Message, args: Args) {
        const value = await args.rest("string");

        const [oldValue] = await Promise.all([
            this.client.botSettings.get(
                "1",
                "CurrencyName",
                Constants.DEFAULTS.BOT_CONFIG.CUR_NAME
            ),
            this.client.botSettings.set("1", "CurrencyName", value),
        ]);

        this.client.money.currencyName = value;

        return BotConfigCommand.sendEmbed(message, oldValue, value);
    }

    public async currencysymbolRun(message: Message, args: Args) {
        const value = await args.rest("string");

        const [oldValue] = await Promise.all([
            this.client.botSettings.get(
                "1",
                "CurrencySymbol",
                Constants.DEFAULTS.BOT_CONFIG.CUR_SYMBOL
            ),
            this.client.botSettings.set("1", "CurrencySymbol", value),
        ]);

        this.client.money.currencySymbol = value;

        return BotConfigCommand.sendEmbed(message, oldValue, value);
    }

    public async dailyEnabledRun(message: Message, args: Args) {
        const value = await args.rest("boolean");

        const oldValue = <boolean>(
			await this.client.botSettings.get("1", "DailyEnabled", false)
		);
        await this.client.botSettings.set("1", "DailyEnabled", value);

        return BotConfigCommand.sendEmbed(
            message,
            String(oldValue),
            String(value)
        );
    }

    public async dailyAmountRun(message: Message, args: Args) {
        const value = await args.rest("number");

        const oldValue = <number>(
			await this.client.botSettings.get(
			    "1",
			    "DailyAmount",
			    Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY.BOT_CONFIG.DAILY_AMOUNT
			)
		);
        await this.client.botSettings.set("1", "DailyAmount", value);

        return BotConfigCommand.sendEmbed(
            message,
            String(oldValue),
            String(value)
        );
    }

    private static sendEmbed = (
        message: Message,
        oldValue: string,
        newValue: string
    ) => {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Changed bot configuration")
                    .addFields([
                        {
                            name: "Old Value",
                            value: String(oldValue),
                        },
                        {
                            name: "New value",
                            value: String(newValue),
                        },
                    ])
                    .withOkColor(message),
            ],
        });
    };
}
