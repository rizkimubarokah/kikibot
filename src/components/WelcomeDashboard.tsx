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
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-white">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-6"
            >
                <h1 className="text-4xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400">
                    {getGreeting()}
                </h1>
                <p className="text-lg md:text-xl text-blue-200/70 font-light">
                    Ruang kerja AI pribadi bersama rizki
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-5"
            >
                <div className="glass-panel p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Waktu Saat Ini</span>
                    </div>
                    <div className="text-3xl font-bold">{formatTime()}</div>
                    <div className="text-sm text-gray-400 mt-1">{formatDate()}</div>
                </div>

                <div className="glass-panel p-5 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Konteks Hari Ini</span>
                    </div>
                    <div className="text-3xl font-bold capitalize flex items-center gap-2">
                        {getSeasonEmoji()}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">{getTimeLabel()} produktif</div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.6 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl mb-5"
            >
                {shortcuts.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onAction?.(item.text)}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-gray-200 hover:border-primary/50 hover:bg-primary/10 transition-colors"
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
                className="glass-panel p-5 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 max-w-2xl w-full"
            >
                <div className="flex items-center gap-3 mb-3">
                    <Brain className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300 tracking-wider">FITUR MODERN</span>
                </div>
                <p className="text-gray-200 leading-relaxed">
                    Gunakan tombol cepat, buka command palette dengan Ctrl K, upload file untuk dianalisis, atau atur memori supaya rizki menjawab sesuai kebiasaanmu.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 text-center"
            >
                <p className="text-blue-300/60 text-sm italic">
                    Ketik sesuatu untuk memulai percakapan...
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeDashboard;
