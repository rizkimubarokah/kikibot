import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sparkles, Calendar } from 'lucide-react';
import { getAutoThemeConfig } from '../utils/timeCycle';

const WelcomeDashboard: React.FC = () => {
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
            winter: '❄️',
            spring: '🌸',
            summer: '☀️',
            autumn: '🍂'
        };
        return seasonMap[season];
    };

    const getTimeEmoji = (): string => {
        if (time === 'morning') return '🌅';
        if (time === 'day') return '☀️';
        if (time === 'sore') return '🌇';
        return '🌙';
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

    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-white">
            {/* Main Greeting Card */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-8"
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-pink-400">
                    {getGreeting()} {getTimeEmoji()}
                </h1>
                <p className="text-xl md:text-2xl text-blue-200/70 font-light">
                    Selamat datang kembali di Galaksi rizki
                </p>
            </motion.div>

            {/* Info Grid */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mb-8"
            >
                {/* Time Card */}
                <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Waktu Saat Ini</span>
                    </div>
                    <div className="text-3xl font-bold">{formatTime()}</div>
                    <div className="text-sm text-gray-400 mt-1">{formatDate()}</div>
                </div>

                {/* Season Card */}
                <div className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Musim</span>
                    </div>
                    <div className="text-3xl font-bold capitalize flex items-center gap-2">
                        {getSeasonEmoji()} {season}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                        {time === 'morning' && 'Pagi Cerah'}
                        {time === 'day' && 'Siang Terik'}
                        {time === 'sore' && 'Senja Indah'}
                        {time === 'night' && 'Malam Sunyi'}
                    </div>
                </div>
            </motion.div>

            {/* Fun Fact Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="glass-panel p-6 rounded-2xl backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-400/20 max-w-2xl w-full"
            >
                <div className="flex items-center gap-3 mb-3">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-bold text-yellow-300 tracking-wider">FAKTA UNIK HARI INI</span>
                </div>
                <p className="text-gray-200 leading-relaxed">
                    {season === 'winter' && '❄️ Tahukah kamu? Kristal salju sebenarnya tidak pernah berbentuk bulat sempurna. Setiap kepingan salju memiliki pola heksagonal yang unik!'}
                    {season === 'spring' && '🌸 Tahukah kamu? Bunga sakura hanya mekar selama 7-10 hari dalam setahun, itulah mengapa mereka sangat dihargai di Jepang!'}
                    {season === 'summer' && '☀️ Tahukah kamu? Matahari bisa memuat lebih dari 1 juta planet Bumi di dalamnya. Sungguh luar biasa!'}
                    {season === 'autumn' && '🍂 Tahukah kamu? Daun berubah warna di musim gugur karena pohon berhenti memproduksi klorofil, mengungkap warna kuning dan merah yang tersembunyi!'}
                </p>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-8 text-center"
            >
                <p className="text-blue-300/60 text-sm italic">
                    Ketik sesuatu untuk memulai percakapan... 💬
                </p>
            </motion.div>
        </div>
    );
};

export default WelcomeDashboard;
