import { Message, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { WeatherResponse, WeatherErrorResponse } from "../Types/Weather";

export class Weather {
    /**
     * Fetches current weather data from OpenWeatherMap API
     * 
     * @param location - City name, city name with country code (e.g., "London,GB"), or coordinates
     * @param context - Discord message or interaction context for embed styling
     * @returns Promise with Discord embed containing weather data or error message
     * 
     * @remarks
     * OpenWeatherMap API Error Codes:
     * - 200: Success
     * - 400: Bad request (invalid parameters)
     * - 401: Unauthorized (invalid API key)
     * - 404: Not found (location not found)
     * - 429: Too many requests (rate limit exceeded)
     * - 500: Internal server error
     * 
     * Temperature is returned in Celsius (with Fahrenheit conversion)
     * Wind speed is in m/s (with mph conversion)
     * Pressure is in hPa
     * Visibility is in meters
     */
    public static async fetchWeather(location: string, context?: Message | ChatInputCommandInteraction): Promise<{ embeds: EmbedBuilder[] }> {
        try {
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&APPID=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
            );

            // Handle API errors with specific status codes
            if (!response.ok) {
                const errorData = await response.json().catch(() => null) as WeatherErrorResponse | null;
                const errorMessage = errorData?.message || "Unknown error";
                
                let title = "Weather lookup failed";
                let description = `Could not fetch weather data for **${location}**.`;
                const defaultDescription = "An error occurred while fetching weather data. Please try again later.";

                switch (response.status) {
                case 404:
                    description = `Location **${location}** not found. Please check the spelling or try a different location name.`;
                    break;
                case 401:
                    title = "API Authentication Error";
                    description = "Invalid API key. Please contact the bot administrator.";
                    break;
                case 429:
                    title = "Rate Limit Exceeded";
                    description = "Too many requests. Please try again in a moment.";
                    break;
                case 400:
                    description = `Invalid request for **${location}**. ${errorMessage}`;
                    break;
                default:
                    description = `Error ${response.status}: ${errorMessage}`;
                }

                if (response.status !== 404) {
                    console.error(`Weather API error - Status: ${response.status}, Message: ${errorMessage}`);
                }

                return {
                    embeds: [
                        new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(response.status === 404
                                ? description
                                : defaultDescription
                            )
                            .withErrorColor(context),
                    ],
                };
            }

            const data = await response.json() as WeatherResponse;
            
            if (!data.main) {
                throw new Error("Invalid weather data received from API");
            }

            const country = data.sys.country;
            const name = data.name;
            const currentUnits = data.main;
            const currentWeather = data.weather[0];
            const weatherIconUrl = currentWeather.icon 
                ? `https://openweathermap.org/img/wn/${currentWeather.icon}@2x.png` 
                : null;

            const fields = [
                {
                    name: "🌡️ Temperature",
                    value: `${Math.round(currentUnits.temp)}°C / ${Math.round(this.CelsiusToFahrenheit(currentUnits.temp))}°F`,
                    inline: true,
                },
                {
                    name: "🤔 Feels Like",
                    value: `${Math.round(currentUnits.feels_like)}°C / ${Math.round(this.CelsiusToFahrenheit(currentUnits.feels_like))}°F`,
                    inline: true,
                },
                {
                    name: "📊 Min/Max",
                    value: `${Math.round(currentUnits.temp_min)}°C / ${Math.round(currentUnits.temp_max)}°C`,
                    inline: true,
                },
                {
                    name: "💨 Wind",
                    value: `${Math.round(data.wind.speed)} m/s (${Math.round(this.MpsToMph(data.wind.speed))} mph) ${this.DegToCompass(data.wind.deg)} (${data.wind.deg}°)`,
                    inline: true,
                },
                {
                    name: "💧 Humidity",
                    value: `${currentUnits.humidity}%`,
                    inline: true,
                },
                {
                    name: "☁️ Cloudiness",
                    value: `${data.clouds.all}%`,
                    inline: true,
                },
                {
                    name: "👁️ Visibility",
                    value: `${(data.visibility / 1000).toFixed(1)} km`,
                    inline: true,
                },
                {
                    name: "🔽 Pressure",
                    value: `${currentUnits.pressure} hPa`,
                    inline: true,
                },
                {
                    name: "🌅 Sunrise/Sunset",
                    value: `${this.formatTime(data.sys.sunrise)} / ${this.formatTime(data.sys.sunset)}`,
                    inline: true,
                },
            ];

            // Add rain data if available
            if (data.rain) {
                const rainAmount = data.rain["1h"] || data.rain["3h"] || 0;
                const timeframe = data.rain["1h"] ? "1h" : "3h";
                fields.push({
                    name: "🌧️ Rain",
                    value: `${rainAmount} mm (${timeframe})`,
                    inline: true,
                });
            }

            // Add snow data if available
            if (data.snow) {
                const snowAmount = data.snow["1h"] || data.snow["3h"] || 0;
                const timeframe = data.snow["1h"] ? "1h" : "3h";
                fields.push({
                    name: "❄️ Snow",
                    value: `${snowAmount} mm (${timeframe})`,
                    inline: true,
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(
                    `Weather in ${name}, ${country} ${this.countryCodeToFlag(country)}`
                )
                .setDescription(`${currentWeather.main} - ${currentWeather.description}`)
                .setThumbnail(weatherIconUrl)
                .addFields(fields)
                .setFooter({
                    text: `Last updated: ${this.formatTime(data.dt)} UTC`,
                })
                .withOkColor(context);

            return { embeds: [embed] };
        } catch (error) {
            console.error("Weather fetch error - ", error);
            return {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(
                            "An error occurred while fetching weather data"
                        )
                        .withErrorColor(context),
                ],
            };
        }
    }
    private static CelsiusToFahrenheit(celsius: number): number {
        return (celsius * 9) / 5 + 32;
    }

    private static DegToCompass(deg: number): string {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    }

    private static MpsToMph(mps: number): number {
        return mps * 2.23694;
    }

    private static formatTime(timestamp: number): string {
        const date = new Date(timestamp * 1000);
        return date.toISOString().substring(11, 16);
    }

    private static countryCodeToFlag(countryCode: string): string {
        return countryCode
            .toUpperCase()
            .split("")
            .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
            .join("");
    }
}