
import React from 'react';
import type { WeatherData } from '../types/weather';
import { Cloud, Droplets, Wind, MapPin, Calendar } from 'lucide-react';

interface WeatherCardProps {
    data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    const current = data.current_condition[0];
    const location = data.nearest_area[0];
    const forecast = data.weather.slice(0, 3);

    return (
        <div className="w-full max-w-sm bg-gradient-to-br from-blue-900/50 to-indigo-900/50 border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-2 backdrop-blur-md">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-300" />
                    <div>
                        <h3 className="font-bold text-white text-sm">
                            {location.areaName[0].value}, {location.country[0].value}
                        </h3>
                        <p className="text-[10px] text-blue-200/70">
                            {current.observation_time} (Local)
                        </p>
                    </div>
                </div>
            </div>

            {/* Current Temp */}
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                <div className="flex items-center gap-4">
                    <span className="text-5xl font-bold text-white tracking-tighter">
                        {current.temp_C}°
                    </span>
                    <div className="flex flex-col items-start gap-1">
                        <span className="text-lg text-blue-200 font-medium">
                            {current.weatherDesc[0].value}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded-full">
                            <span>Feels Like {current.FeelsLikeC}°</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-3 gap-px bg-white/5">
                <div className="p-3 flex flex-col items-center justify-center gap-1 bg-black/10">
                    <Wind className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-white font-medium">{current.windspeedKmph} km/h</span>
                    <span className="text-[10px] text-blue-300/60">Wind</span>
                </div>
                <div className="p-3 flex flex-col items-center justify-center gap-1 bg-black/10">
                    <Droplets className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-white font-medium">{current.humidity}%</span>
                    <span className="text-[10px] text-blue-300/60">Humidity</span>
                </div>
                <div className="p-3 flex flex-col items-center justify-center gap-1 bg-black/10">
                    <Cloud className="w-4 h-4 text-blue-300" />
                    <span className="text-xs text-white font-medium">{current.cloudcover}%</span>
                    <span className="text-[10px] text-blue-300/60">Cloud</span>
                </div>
            </div>

            {/* Forecast */}
            <div className="p-3 space-y-2">
                <h4 className="text-xs font-semibold text-blue-200 mb-2 pl-1">3-Day Forecast</h4>
                {forecast.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-indigo-300" />
                            <span className="text-xs text-gray-300">{day.date}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white">{day.maxtempC}°</span>
                            <span className="text-xs text-gray-500">/</span>
                            <span className="text-xs text-gray-400">{day.mintempC}°</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherCard;
