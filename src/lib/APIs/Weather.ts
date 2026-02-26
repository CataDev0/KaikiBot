import { Message, ChatInputCommandInteraction, EmbedBuilder, EmbedField } from "discord.js";
import { WeatherResponse, WeatherErrorResponse, ForecastResponse, ForecastItem } from "../Types/Weather";

export class Weather {

    private static baseUrl = "https://api.openweathermap.org/data/2.5";
    private static weatherEndpoint = `${this.baseUrl}/weather`;
    private static forecastEndpoint = `${this.baseUrl}/forecast`;

    private static readonly weatherIcons: Record<string, string> = Object.freeze({
        "01d": "☀️",
        "01n": "🌙",
        "02d": "⛅",
        "02n": "☁️",
        "03d": "☁️",
        "03n": "☁️",
        "04d": "☁️",
        "04n": "☁️",
        "09d": "🌧️",
        "09n": "🌧️",
        "10d": "🌦️",
        "10n": "🌧️",
        "11d": "⛈️",
        "11n": "⛈️",
        "13d": "❄️",
        "13n": "❄️",
        "50d": "🌫️",
        "50n": "🌫️",
    });

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
        let data: WeatherResponse;
        try {
            const response = await fetch(
                `${this.weatherEndpoint}?q=${encodeURIComponent(location)}&APPID=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`
            );

            // Handle API errors with specific status codes
            if (!response.ok) {
                return this.handleApiError(response, location, context, "weather");
            }

            data = await response.json() as WeatherResponse;
            
            if (!data.main) {
                throw new Error("Invalid weather data received from API");
            }

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
                .setDescription(`${this.weatherIcons[currentWeather.icon] || ""} ${currentWeather.main} - ${currentWeather.description}`)
                .setThumbnail(weatherIconUrl)
                .addFields(fields)
                .setFooter({
                    text: "Weather data provided by OpenWeatherMap",
                })
                .withOkColor(context);

            return { embeds: [embed] };
    }

    public static async fetchForecast(location: string, context?: Message | ChatInputCommandInteraction): Promise<{ embeds: EmbedBuilder[] }> {
        let data: ForecastResponse;

        try {
            const response = await fetch(`${this.forecastEndpoint}?q=${encodeURIComponent(location)}&APPID=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`);

            if (!response.ok) {
                return this.handleApiError(response, location, context, "forecast");
            }

            data = await response.json() as ForecastResponse;

            if (!data.list || data.list.length === 0) {
                throw new Error("Invalid forecast data received from API");
            }
        } catch (error) {
            console.error("Forecast fetch error - ", error);
            return {
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription("An error occurred while fetching forecast data")
                        .withErrorColor(context),
                ],
            };
        }

        const dailyForecasts = new Map<string, ForecastItem[]>();

        // Group by date
        for (const item of data.list) {
            const date = item.dt_txt.split(" ")[0];
            if (!dailyForecasts.has(date)) {
                dailyForecasts.set(date, []);
            }
            dailyForecasts.get(date)?.push(item);
        }

        const fields: EmbedField[] = [];
        let count = 0;
        let weatherIconUrl: string | null = null;

        for (const [date, items] of dailyForecasts) {
            // Set icon from the first day's noon forecast (or first available)
            if (count === 0 && items.length > 0) {
                const iconCode = items[Math.floor(items.length / 2)].weather[0].icon;
                weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
            }

            // Target times: 09:00, 15:00, 21:00
            const targets = [9, 15, 21];
            const selectedItems: (ForecastItem | null)[] = [null, null, null];

            const getHour = (dt_txt: string) => parseInt(dt_txt.split(" ")[1].split(":")[0]);

            targets.forEach((target, index) => {
                // Find closest item to target hour
                // If items is empty, stays null
                if (items.length > 0) {
                    const closest = items.reduce((prev, curr) => {
                        return Math.abs(getHour(curr.dt_txt) - target) < Math.abs(getHour(prev.dt_txt) - target)
                            ? curr : prev;
                    });
                    
                    selectedItems[index] = closest;
                }
            });
            
            const uniqueIds = new Set();
            selectedItems.forEach((item, idx) => {
                if (item) {
                    if (uniqueIds.has(item.dt)) {
                        selectedItems[idx] = null;
                    } else {
                        uniqueIds.add(item.dt);
                    }
                }
            });

            // Parse date
            const [year, month, day] = date.split("-").map(Number);
            const dateObj = new Date(year, month - 1, day);
            const weekday = dateObj.toLocaleDateString("en-US", { weekday: "short" });
            const dayMonth = dateObj.toLocaleDateString("en-US", { day: "numeric" });
            const dateStr = `${weekday} ${dayMonth}`;

            // Calculate daily min/max
            const dailyMax = Math.round(Math.max(...items.map(i => i.main.temp_max)));
            const dailyMin = Math.round(Math.min(...items.map(i => i.main.temp_min)));

            selectedItems.forEach((item, index) => {
                const colName = index === 0 ? `**${dateStr}** (${dailyMax}°C / ${dailyMin}°C)` : "\u200b"; 
                // Show date & daily high/low in first col

                if (item) {
                    const temp = Math.round(item.main.temp);
                    const time = item.dt_txt.split(" ")[1].substring(0, 5);
                    const weatherDesc = item.weather[0].main;
                    const icon = this.weatherIcons[item.weather[0].icon] || "";
                    const pop = Math.round(item.pop * 100);
                    const popStr = pop > 0 ? ` 💧${pop}%` : "";

                    fields.push({
                        name: colName,
                        value: `\`${time}\` **${temp}°C** ${icon}${popStr}\n*${weatherDesc}*`,
                        inline: true,
                    });
                }
            });

            count++;
        }

        const embed = new EmbedBuilder()
            .setTitle(`Forecast for ${data.city.name}, ${data.city.country} ${this.countryCodeToFlag(data.city.country)}`)
            .addFields(fields)
            .setFooter({ text: "Forecast provided by OpenWeatherMap" })
            .withOkColor(context);
        
        if (weatherIconUrl) {
            embed.setThumbnail(weatherIconUrl);
        }

        return { embeds: [embed] };
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

    private static async handleApiError(
        response: Response,
        location: string,
        context?: Message | ChatInputCommandInteraction,
        type: "weather" | "forecast" = "weather"
    ): Promise<{ embeds: EmbedBuilder[] }> {
        const errorData = await response.json().catch(() => null) as WeatherErrorResponse | null;
        const errorMessage = errorData?.message || "Unknown error";

        const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
        let title = `${typeCapitalized} lookup failed`;
        let description = `Could not fetch ${type} data for **${location}**.`;
        const defaultDescription = `An error occurred while fetching ${type} data. Please try again later.`;

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
            console.error(`${typeCapitalized} API error - Status: ${response.status}, Message: ${errorMessage}`);
        }

        return {
            embeds: [
                new EmbedBuilder()
                    .setTitle(title)
                    .setDescription(response.status === 404 ? description : defaultDescription)
                    .withErrorColor(context),
            ],
        };
    }
}