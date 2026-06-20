
export interface CurrentCondition {
    FeelsLikeC: string;
    cloudcover: string;
    humidity: string;
    localObsDateTime: string;
    observation_time: string;
    precipMM: string;
    pressure: string;
    temp_C: string;
    uvIndex: string;
    visibility: string;
    weatherCode: string;
    weatherDesc: { value: string }[];
    weatherIconUrl: { value: string }[];
    winddir16Point?: string;
    windspeedKmph: string;
}

export interface WeatherHourly {
    chanceofrain?: string;
    chanceofsnow?: string;
    cloudcover?: string;
    humidity?: string;
    precipMM?: string;
    tempC?: string;
    time?: string;
    weatherCode?: string;
    weatherDesc?: { value: string }[];
    windspeedKmph?: string;
}

export interface WeatherForecast {
    date: string;
    astronomy: {
        sunrise: string;
        sunset: string;
    }[];
    maxtempC: string;
    mintempC: string;
    avgtempC: string;
    totalSnow_cm: string;
    sunHour: string;
    uvIndex: string;
    hourly?: WeatherHourly[];
}

export interface WeatherData {
    current_condition: CurrentCondition[];
    weather: WeatherForecast[];
    nearest_area: {
        areaName: { value: string }[];
        country: { value: string }[];
        region: { value: string }[];
    }[];
    request?: {
        query: string;
        type: string;
    }[];
}
