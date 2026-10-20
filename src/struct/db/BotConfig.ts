import { ActivityType } from "discord.js";

export class BotConfig {
    private activity: string;
    private activityType: ActivityType;
    private currencyName: string;
    private currencySymbol: string;
    private dailyEnabled: boolean;
    private dailyAmount: number;

    constructor(data: any) {
        this.activity = data.Activity;
        this.activityType = data.ActivityType;
        this.currencyName = data.CurrencyName;
        this.currencySymbol = data.CurrencySymbol;
        this.dailyEnabled = Boolean(data.DailyEnabled);
        this.dailyAmount = parseInt(data.DailyAmount);
    }
}
