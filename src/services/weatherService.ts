
import type { WeatherData } from '../types/weather';

const WEATHER_TIMEOUT_MS = 10000;

const isUnknownLocation = (data: WeatherData) => {
    const areaName = data.nearest_area?.[0]?.areaName?.[0]?.value?.toLowerCase();
    const country = data.nearest_area?.[0]?.country?.[0]?.value?.toLowerCase();
    const requestedQuery = data.request?.[0]?.query?.toLowerCase();

    return !data.current_condition?.length
        || !data.weather?.length
        || areaName === 'unknown'
        || country === 'unknown'
        || requestedQuery === 'lat 0 and lon 0';
};

export const getWeather = async (location: string): Promise<WeatherData> => {
    const cleanLocation = location.trim().replace(/\s+/g, ' ');

    if (cleanLocation.length < 2) {
        throw new Error('Masukkan nama kota atau lokasi yang lebih jelas.');
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), WEATHER_TIMEOUT_MS);

    try {
        const params = new URLSearchParams({
            format: 'j1',
            lang: 'id',
            m: ''
        });
        const response = await fetch(`https://wttr.in/${encodeURIComponent(cleanLocation)}?${params.toString()}`, {
            signal: controller.signal,
            headers: {
                Accept: 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Layanan cuaca sedang bermasalah (${response.status}). Coba lagi sebentar lagi.`);
        }

        const data: WeatherData = await response.json();

        if (isUnknownLocation(data)) {
            throw new Error(`Lokasi "${cleanLocation}" belum ditemukan. Coba tulis lebih spesifik, misalnya "Jakarta Selatan" atau "Bandung, Indonesia".`);
        }

        return data;
    } catch (error) {
        console.error('Error fetching weather:', error);

        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new Error('Permintaan cuaca terlalu lama. Coba lagi sebentar lagi.');
        }

        throw error;
    } finally {
        window.clearTimeout(timeoutId);
    }
};
