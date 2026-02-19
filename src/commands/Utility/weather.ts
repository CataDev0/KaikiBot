import { ApplyOptions } from "@sapphire/decorators";
import { Args, ApplicationCommandRegistry } from "@sapphire/framework";
import {
    Awaitable,
    ChatInputCommandInteraction,
    Message,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { Weather } from "../../lib/APIs/Weather";

@ApplyOptions<KaikiCommandOptions>({
    name: "weather",
    aliases: ["we"],
    description: "Get current weather information for a specified location",
    usage: ["London", "New York", "Tokyo"],
    typing: true,
    minorCategory: "Info",
})
export default class WeatherCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const location = await args.rest("string").catch(() => {
            throw new Error("Please provide a location to check the weather for.");
        });

        const embed = await Weather.fetchWeather(location, message);
        return message.reply(embed);
    }

    public registerApplicationCommands(
        registry: ApplicationCommandRegistry
    ): Awaitable<void> {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName("weather")
                .setDescription("Get current weather information for a location")
                .addStringOption((option) =>
                    option
                        .setName("location")
                        .setDescription("The location to check weather for")
                        .setRequired(true)
                )
        );
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        const location = interaction.options.getString("location", true);

        await interaction.deferReply();

        const embed = await Weather.fetchWeather(location, interaction);

        return interaction.editReply(embed);
    }
}
