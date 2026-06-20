import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Clock, Cloud, FileText, Image, Sparkles, Calendar } from 'lucide-react';
import { getAutoThemeConfig } from '../utils/timeCycle';

interface WelcomeDashboardProps {
    onAction?: (text: string) => void;
}

const WelcomeDashboard: React.FC<WelcomeDashboardProps> = ({ onAction }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { season, time } = getAutoThemeConfig();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const getGreeting = (): string => {
        const hour = currentTime.getHours();
        if (hour >= 5 && hour < 11) return 'Selamat Pagi';
        if (hour >= 11 && hour < 15) return 'Selamat Siang';
        if (hour >= 15 && hour < 19) return 'Selamat Sore';
        return 'Selamat Malam';
    };

    const getSeasonEmoji = (): string => {
        const seasonMap = {
            winter: 'Winter',
            spring: 'Spring',
            summer: 'Summer',
            autumn: 'Autumn'
        };
        return seasonMap[season];
    };

    const getTimeLabel = (): string => {
        if (time === 'morning') return 'Pagi';
        if (time === 'day') return 'Siang';
        if (time === 'sore') return 'Sore';
        return 'Malam';
    };

    const formatTime = (): string => {
        return currentTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (): string => {
        return currentTime.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const shortcuts = [
        { label: 'Brief harian', icon: <Sparkles className="w-4 h-4" />, text: 'Buatkan brief harian: fokus utama, agenda, dan saran prioritas.' },
        { label: 'Belajar', icon: <FileText className="w-4 h-4" />, text: 'Aktifkan mode belajar. Bantu aku membuat rangkuman, kuis, dan flashcard.' },
        { label: 'Gambar', icon: <Image className="w-4 h-4" />, text: 'buatkan gambar pemandangan kota futuristik saat malam, cinematic, detail' },
        { label: 'Cuaca', icon: <Cloud className="w-4 h-4" />, text: 'cek cuaca Jakarta' }
    ];

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start overflow-y-auto px-4 pb-5 pt-10 text-white sm:justify-center sm:p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-4 text-center sm:mb-6"
            >
                <h1 className="mb-1 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400 sm:mb-2 md:text-6xl">
                    {getGreeting()}
                </h1>
                <p className="text-sm font-light text-blue-200/70 sm:text-lg md:text-xl">
                    Ruang kerja AI pribadi bersama rizki
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mb-4 grid w-full max-w-2xl grid-cols-2 gap-2 sm:mb-5 sm:gap-4"
            >
                <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-5">
                    <div className="mb-1 flex items-center gap-2 sm:mb-2 sm:gap-3">
                        <Clock className="h-4 w-4 text-blue-400 sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium text-blue-300 sm:text-sm">Waktu</span>
                    </div>
                    <div className="text-xl font-bold sm:text-3xl">{formatTime()}</div>
                    <div className="mt-1 line-clamp-2 text-[11px] text-gray-400 sm:text-sm">{formatDate()}</div>
                </div>

                <div className="glass-panel rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-5">
                    <div className="mb-1 flex items-center gap-2 sm:mb-2 sm:gap-3">
                        <Calendar className="h-4 w-4 text-purple-400 sm:h-5 sm:w-5" />
                        <span className="text-xs font-medium text-purple-300 sm:text-sm">Konteks</span>
                    </div>
                    <div className="flex items-center gap-2 text-xl font-bold capitalize sm:text-3xl">
                        {getSeasonEmoji()}
                    </div>
                    <div className="mt-1 text-[11px] text-gray-400 sm:text-sm">{getTimeLabel()} produktif</div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="mb-4 grid w-full max-w-2xl grid-cols-2 gap-2 sm:mb-5 sm:grid-cols-4 sm:gap-3"
            >
                {shortcuts.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onAction?.(item.text)}
                        className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-xs text-gray-200 transition-colors hover:border-primary/50 hover:bg-primary/10 sm:px-3 sm:py-3 sm:text-sm"
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="glass-panel w-full max-w-2xl rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-3 backdrop-blur-xl sm:p-5"
            >
                <div className="mb-2 flex items-center gap-2 sm:mb-3 sm:gap-3">
                    <Brain className="h-4 w-4 text-yellow-400 sm:h-5 sm:w-5" />
                    <span className="text-xs font-bold tracking-wider text-yellow-300 sm:text-sm">FITUR MODERN</span>
                </div>
                <p className="text-xs leading-relaxed text-gray-200 sm:text-base">
                    Gunakan tombol cepat, buka command palette dengan Ctrl K, upload file untuk dianalisis, atau atur memori supaya rizki menjawab sesuai kebiasaanmu.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-4 text-center sm:mt-6"
            >
                <p className="text-xs italic text-blue-300/60 sm:text-sm">
                    Ketik sesuatu untuk memulai percakapan...
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeDashboard;
