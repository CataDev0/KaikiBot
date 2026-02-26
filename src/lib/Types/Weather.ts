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

export interface ForecastResponse {
    cod: string;
    message: number;
    cnt: number;
    list: ForecastItem[];
    city: {
        id: number;
        name: string;
        coord: {
            lat: number;
            lon: number;
        };
        country: string;
        population: number;
        timezone: number;
        sunrise: number;
        sunset: number;
    };
}

export interface ForecastItem {
    dt: number;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        sea_level: number;
        grnd_level: number;
        humidity: number;
        temp_kf: number;
    };
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    clouds: {
        all: number;
    };
    wind: {
        speed: number;
        deg: number;
        gust: number;
    };
    visibility: number;
    pop: number;
    rain?: {
        "3h": number;
    };
    snow?: {
        "3h": number;
    };
    sys: {
        pod: string;
    };
    dt_txt: string;
}