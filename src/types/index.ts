import type { MediaData } from '../services/mediaDownloader';
import type { MedicalStats } from './medical';
import type { WeatherData } from './weather';

export type Message = {
    id: number;
    sender: 'user' | 'bot';
    text: string;
    timestamp: number;
    gameId?: string;
    musicData?: {
        title: string;
        author: string;
        thumbnail: string;
        url: string;
    };
    mediaData?: MediaData; // Enhanced media with multi-quality downloads
    medicalData?: MedicalStats;
    weatherData?: WeatherData;
    imageUrl?: string;
};

export interface ChatSession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
    isPinned?: boolean;
}
