import { ApplyOptions } from "@sapphire/decorators";
import { Args, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    Awaitable,
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { Weather } from "../../lib/APIs/Weather";

@ApplyOptions<KaikiCommandOptions>({
    name: "forecast",
    aliases: ["fc"],
    description: "Get weather forecast for the specified location",
    usage: ["London", "New York", "Tokyo"],
    typing: true,
    minorCategory: "Info",
})
export default class ForecastCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const location = await args.rest("string").catch(() => {
            throw new Error("Please provide a location to check the weather for.");
        });

        const embed = await Weather.fetchForecast(location, message);
        return message.reply(embed);
    }

    public registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ): Awaitable<void> {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName("forecast")
                .setDescription("Get weather forecast for a location")
                .addStringOption((option) =>
                    option
                        .setName("location")
                        .setDescription("The location to check get weather forecast for")
                        .setRequired(true)
                )
        );
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        const location = interaction.options.getString("location", true);

        await interaction.deferReply();

        const embed = await Weather.fetchForecast(location, interaction);

        return interaction.editReply(embed);
    }
}
