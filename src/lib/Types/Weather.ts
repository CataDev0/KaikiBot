export interface WeatherResponse {
    coord: {
        lon: number;
        lat: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    base: string;
    main: {
        temp: number;
        feels_like: number;
        pressure: number;
        humidity: number;
        temp_min: number;
        temp_max: number;
    };
    rain?: {
        "1h"?: number;
        "3h"?: number;
    };
    snow?: {
        "1h"?: number;
        "3h"?: number;
    };
    visibility: number;
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    dt: number;
    sys: {
        type: number;
        id: number;
        message?: number;
        country: string;
        sunrise: number;
        sunset: number;
    };
    id: number;
    name: string;
    cod: number;
}

/**
 * Error response structure from OpenWeatherMap API
 */
export interface WeatherErrorResponse {
    cod: string | number;
    message: string;
}