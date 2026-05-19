
import type { WeatherData } from '../types/weather';

export const getWeather = async (location: string): Promise<WeatherData> => {
    try {
        // wttr.in format=j1 returns JSON
        const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);

        if (!response.ok) {
            throw new Error(`Weather API Error: ${response.status}`);
        }

        const data: WeatherData = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);
        throw error;
    }
};
