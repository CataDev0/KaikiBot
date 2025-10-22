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

        const embed = await this.fetchWeather(location, message);
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

        const embed = await this.fetchWeather(location, interaction);

        return interaction.editReply(embed);
    }

    private async fetchWeather(location: string, context?: Message | ChatInputCommandInteraction): Promise<{ embeds: EmbedBuilder[] }> {
        try {
            const response = await fetch(
                `https://wttr.in/${encodeURIComponent(location)}?format=j1`
            );

            if (!response.ok) {
                return {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Weather lookup failed")
                            .setDescription(
                                `Could not find weather data for **${location}**. Please check the location name and try again.`
                            )
                            .withErrorColor(context),
                    ],
                };
            }

            const data = await response.json();
            
            if (!data.current_condition?.[0] || !data.nearest_area?.[0]) {
                throw new Error("Invalid weather data received from API");
            }
            
            const current = data.current_condition[0];
            const nearest = data.nearest_area[0];

            const areaName = nearest.areaName?.[0]?.value || nearest.areaName?.[0] || "Unknown";
            const country = nearest.country?.[0]?.value || nearest.country?.[0] || "Unknown";
            const weatherDesc = current.weatherDesc?.[0]?.value || current.weatherDesc?.[0] || "No description";
            const weatherIconUrl = current.weatherIconUrl?.[0]?.value || "";

            const embed = new EmbedBuilder()
                .setTitle(
                    `Weather in ${areaName}, ${country}`
                )
                .setDescription(weatherDesc)
                .setThumbnail(weatherIconUrl ? `https:${weatherIconUrl}` : null)
                .addFields([
                    {
                        name: "🌡️ Temperature",
                        value: `${current.temp_C}°C / ${current.temp_F}°F`,
                        inline: true,
                    },
                    {
                        name: "🤔 Feels Like",
                        value: `${current.FeelsLikeC}°C / ${current.FeelsLikeF}°F`,
                        inline: true,
                    },
                    {
                        name: "💨 Wind",
                        value: `${current.windspeedKmph} km/h ${current.winddir16Point}`,
                        inline: true,
                    },
                    {
                        name: "💧 Humidity",
                        value: `${current.humidity}%`,
                        inline: true,
                    },
                    {
                        name: "🌧️ Precipitation",
                        value: `${current.precipMM} mm`,
                        inline: true,
                    },
                    {
                        name: "👁️ Visibility",
                        value: `${current.visibility} km`,
                        inline: true,
                    },
                    {
                        name: "🔽 Pressure",
                        value: `${current.pressure} mb`,
                        inline: true,
                    },
                    {
                        name: "☀️ UV Index",
                        value: current.uvIndex,
                        inline: true,
                    },
                ])
                .setFooter({
                    text: `Observation time (local): ${data.current_condition[0].observation_time}`,
                })
                .withOkColor(context);

            return { embeds: [embed] };
        } catch (error) {
            console.error("Weather fetch error:", error);
            return {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(
                            `An error occurred while fetching weather data: ${error instanceof Error ? error.message : "Unknown error"}`
                        )
                        .withErrorColor(context),
                ],
            };
        }
    }
}
