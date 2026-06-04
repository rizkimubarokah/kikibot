import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Cloud, Download, FileText, Gamepad2, Image, Search, Sparkles, X } from 'lucide-react';

export type CommandId =
    | 'new-chat'
    | 'search'
    | 'memory'
    | 'export'
    | 'image-studio'
    | 'study-mode'
    | 'daily-brief'
    | 'weather'
    | 'game';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onRunCommand: (command: CommandId) => void;
}

const commands: Array<{
    id: CommandId;
    title: string;
    description: string;
    icon: React.ReactNode;
}> = [
    { id: 'new-chat', title: 'Chat baru', description: 'Mulai ruang obrolan kosong', icon: <Bot className="w-4 h-4" /> },
    { id: 'search', title: 'Cari riwayat', description: 'Temukan pesan lama dengan cepat', icon: <Search className="w-4 h-4" /> },
    { id: 'memory', title: 'Memori rizki', description: 'Atur cara rizki mengingat preferensimu', icon: <Brain className="w-4 h-4" /> },
    { id: 'export', title: 'Ekspor chat', description: 'Simpan percakapan ke Markdown', icon: <Download className="w-4 h-4" /> },
    { id: 'image-studio', title: 'Image studio', description: 'Buat prompt gambar dengan format modern', icon: <Image className="w-4 h-4" /> },
    { id: 'study-mode', title: 'Mode belajar', description: 'Minta rangkuman, kuis, dan flashcard', icon: <FileText className="w-4 h-4" /> },
    { id: 'daily-brief', title: 'Dashboard harian', description: 'Minta agenda, cuaca, dan fokus hari ini', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'weather', title: 'Cek cuaca', description: 'Gunakan perintah cuaca cepat', icon: <Cloud className="w-4 h-4" /> },
    { id: 'game', title: 'Buka game', description: 'Main mini game dari rizki', icon: <Gamepad2 className="w-4 h-4" /> }
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onRunCommand }) => {
    const [query, setQuery] = useState('');

    const filteredCommands = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return commands;

        return commands.filter((command) =>
            `${command.title} ${command.description}`.toLowerCase().includes(normalized)
        );
    }, [query]);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-start justify-center px-4 pt-24"
                    onMouseDown={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-dark-lighter shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                            <Search className="w-5 h-5 text-primary" />
                            <input
                                autoFocus
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Cari fitur atau ketik perintah..."
                                className="w-full bg-transparent text-white placeholder:text-gray-500 focus:outline-none"
                            />
                            <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="max-h-[420px] overflow-y-auto p-2">
                            {filteredCommands.map((command) => (
                                <button
                                    key={command.id}
                                    onClick={() => {
                                        onRunCommand(command.id);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/5 transition-colors"
                                >
                                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        {command.icon}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-sm font-semibold text-white">{command.title}</span>
                                        <span className="block text-xs text-gray-400">{command.description}</span>
                                    </span>
                                </button>
                            ))}

                            {filteredCommands.length === 0 && (
                                <div className="px-4 py-8 text-center text-sm text-gray-500">
                                    Fitur tidak ditemukan.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
