import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "choose",
    aliases: ["choice", "pick"],
    description: "Bot chooses one of the provided options.",
    usage: ["Option 1, Option 2, Option 3", "Pizza | Burger | Sushi"],
})
export default class ChoiceCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const input = await args.rest("string").catch(() => null);

        if (!input) {
            throw new UserError({
                identifier: "NoChoicesProvided",
                message: "Please provide options separated by commas (`,`) or pipes (`|`).",
            });
        }

        const separator = input.includes("|") ? "|" : ",";
        const choices = input.split(separator).map(c => c.trim()).filter(c => c.length > 0);

        if (choices.length < 2) {
            return message.reply({
                embeds: [new EmbedBuilder()
                    .setDescription("Please provide at least two choices!")
                    .withErrorColor(message)],
            });
        }

        const picked = choices[Math.floor(Math.random() * choices.length)];

        const embed = new EmbedBuilder()
            .setTitle("Your option is...")
            .setDescription(`**${picked}**`)
            .withOkColor(message);

        return message.reply({ embeds: [embed] });
    }
}
