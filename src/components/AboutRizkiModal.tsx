import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Bot,
    Brain,
    Download,
    FileText,
    Gamepad2,
    Image,
    MessageSquare,
    RefreshCcw,
    ShieldAlert,
    Sparkles,
    X
} from 'lucide-react';
import botAvatar from '../assets/hu-tao-profile.webp';

interface AboutRizkiModalProps {
    isOpen: boolean;
    appVersion: string;
    sessionCount: number;
    messageCount: number;
    memoryCount: number;
    onClose: () => void;
    onExportChat: () => void;
    onResetData: () => void;
}

const features = [
    { label: 'Chat AI', icon: MessageSquare },
    { label: 'Memori', icon: Brain },
    { label: 'Analisis file', icon: FileText },
    { label: 'Gambar AI', icon: Image },
    { label: 'Mini game', icon: Gamepad2 },
    { label: 'Quick tools', icon: Sparkles }
];

const AboutRizkiModal: React.FC<AboutRizkiModalProps> = ({
    isOpen,
    appVersion,
    sessionCount,
    messageCount,
    memoryCount,
    onClose,
    onExportChat,
    onResetData
}) => {
    const [isConfirmingReset, setIsConfirmingReset] = useState(false);

    const handleClose = () => {
        setIsConfirmingReset(false);
        onClose();
    };

    const handleReset = () => {
        if (!isConfirmingReset) {
            setIsConfirmingReset(true);
            return;
        }

        onResetData();
        setIsConfirmingReset(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 24, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 18, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-dark-lighter shadow-2xl shadow-black/50"
                    >
                        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-primary/20 via-accent/10 to-transparent" />

                        <div className="relative p-6">
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                                            <img src={botAvatar} alt="rizki" className="h-full w-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-dark-lighter bg-green-400 text-dark">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">About rizki</h2>
                                        <p className="text-sm text-gray-400">Asisten AI pribadi</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleClose}
                                    className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                                    title="Tutup"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-5 grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Versi', value: appVersion },
                                    { label: 'Sesi', value: sessionCount },
                                    { label: 'Pesan', value: messageCount }
                                ].map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-3">
                                        <div className="text-xs text-gray-500">{item.label}</div>
                                        <div className="mt-1 truncate text-lg font-bold text-white">{item.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <div className="text-sm font-semibold text-white">Fitur utama</div>
                                    <div className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">
                                        {memoryCount} memori
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {features.map((feature) => {
                                        const Icon = feature.icon;

                                        return (
                                            <div
                                                key={feature.label}
                                                className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2 text-sm text-gray-300"
                                            >
                                                <Icon className="h-4 w-4 text-accent" />
                                                <span>{feature.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <button
                                    onClick={onExportChat}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-gray-200 transition-colors hover:border-secondary/50 hover:bg-secondary/10 hover:text-white"
                                >
                                    <Download className="h-4 w-4" />
                                    Export Chat
                                </button>
                                <button
                                    onClick={handleReset}
                                    className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${isConfirmingReset
                                        ? 'border-red-400/60 bg-red-500/20 text-red-100 hover:bg-red-500/30'
                                        : 'border-white/10 bg-white/5 text-gray-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-white'
                                        }`}
                                >
                                    {isConfirmingReset ? <ShieldAlert className="h-4 w-4" /> : <RefreshCcw className="h-4 w-4" />}
                                    {isConfirmingReset ? 'Konfirmasi Reset' : 'Reset Data'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AboutRizkiModal;
