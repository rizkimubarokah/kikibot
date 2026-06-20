import React from 'react';
import type { WeatherData, WeatherHourly } from '../types/weather';
import {
    CalendarDays,
    Cloud,
    CloudRain,
    Compass,
    Droplets,
    Eye,
    Gauge,
    MapPin,
    Sunrise,
    Sunset,
    Thermometer,
    Umbrella,
    Wind
} from 'lucide-react';

interface WeatherCardProps {
    data: WeatherData;
}

const safeValue = (value: string | undefined, fallback = '-') => value && value.trim() ? value : fallback;

const formatForecastDate = (date: string) => {
    const parsedDate = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    }).format(parsedDate);
};

const getRainChance = (hourly: WeatherHourly[] = []) => {
    const values = hourly
        .map((item) => Number(item.chanceofrain || 0))
        .filter((value) => Number.isFinite(value));

    if (!values.length) return '0';
    return String(Math.max(...values));
};

const deg = '°';

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    const current = data.current_condition?.[0];
    const location = data.nearest_area?.[0];
    const forecast = data.weather?.slice(0, 3) || [];

    if (!current || !location) {
        return (
            <div className="w-full rounded-2xl border border-red-400/20 bg-red-950/30 p-4 text-sm text-red-100">
                Data cuaca belum lengkap. Coba cek lokasi lain.
            </div>
        );
    }

    const city = safeValue(location.areaName?.[0]?.value, 'Lokasi');
    const region = safeValue(location.region?.[0]?.value, '');
    const country = safeValue(location.country?.[0]?.value, '');
    const description = safeValue(current.weatherDesc?.[0]?.value, 'Cuaca terkini');
    const today = forecast[0];
    const astronomy = today?.astronomy?.[0];
    const rainChance = getRainChance(today?.hourly);
    const windDirection = safeValue(current.winddir16Point, '');
    const placeLabel = [city, region || country].filter(Boolean).join(', ');

    const stats = [
        { icon: Wind, label: 'Angin', value: `${current.windspeedKmph} km/jam${windDirection ? ` ${windDirection}` : ''}` },
        { icon: Droplets, label: 'Kelembapan', value: `${current.humidity}%` },
        { icon: CloudRain, label: 'Peluang hujan', value: `${rainChance}%` },
        { icon: Cloud, label: 'Awan', value: `${current.cloudcover}%` },
        { icon: Gauge, label: 'Tekanan', value: `${current.pressure} hPa` },
        { icon: Eye, label: 'Jarak pandang', value: `${current.visibility} km` },
        { icon: Umbrella, label: 'Curah hujan', value: `${current.precipMM} mm` },
        { icon: Thermometer, label: 'UV index', value: safeValue(current.uvIndex) },
    ];

    return (
        <div className="my-2 w-full max-w-xl overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950/70 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
            <div className="bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-fuchsia-500/10 p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-cyan-100/80">
                            <MapPin className="h-4 w-4 flex-shrink-0 text-cyan-300" />
                            <span className="truncate">{placeLabel}</span>
                        </div>
                        <div className="flex items-end gap-3">
                            <span className="text-6xl font-bold leading-none tracking-normal text-white">
                                {current.temp_C}{deg}
                            </span>
                            <div className="pb-1">
                                <p className="text-base font-semibold text-cyan-50">{description}</p>
                                <p className="text-xs text-cyan-100/70">
                                    Terasa seperti {current.FeelsLikeC}{deg}C
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
                        <p className="text-[10px] uppercase tracking-wider text-cyan-100/60">Update</p>
                        <p className="text-xs font-semibold text-white">{safeValue(current.observation_time)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/5 sm:grid-cols-4">
                {stats.map((item) => (
                    <div key={item.label} className="min-h-[78px] bg-black/20 p-3">
                        <div className="mb-2 flex items-center gap-2 text-cyan-200/80">
                            <item.icon className="h-4 w-4" />
                            <span className="text-[11px]">{item.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                    </div>
                ))}
            </div>

            {(astronomy?.sunrise || astronomy?.sunset) && (
                <div className="grid grid-cols-2 gap-2 border-b border-white/10 px-4 py-3">
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                        <Sunrise className="h-4 w-4 text-amber-200" />
                        <div>
                            <p className="text-[10px] text-slate-400">Terbit</p>
                            <p className="text-xs font-semibold text-white">{safeValue(astronomy?.sunrise)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
                        <Sunset className="h-4 w-4 text-orange-300" />
                        <div>
                            <p className="text-[10px] text-slate-400">Terbenam</p>
                            <p className="text-xs font-semibold text-white">{safeValue(astronomy?.sunset)}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-2 p-4">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-100/70">
                    <CalendarDays className="h-4 w-4" />
                    Prakiraan 3 Hari
                </h4>
                {forecast.map((day, index) => (
                    <div key={day.date || index} className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2 transition-colors hover:bg-white/[0.07]">
                        <div>
                            <p className="text-sm font-medium text-white">{index === 0 ? 'Hari ini' : formatForecastDate(day.date)}</p>
                            <p className="text-[11px] text-slate-400">
                                Rata-rata {day.avgtempC}{deg}C / UV {day.uvIndex}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Compass className="h-4 w-4 text-cyan-200/70" />
                            <span className="font-bold text-white">{day.maxtempC}{deg}</span>
                            <span className="text-slate-500">/</span>
                            <span className="text-slate-300">{day.mintempC}{deg}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WeatherCard;
