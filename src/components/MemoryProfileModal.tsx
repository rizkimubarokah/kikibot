import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Save, X } from 'lucide-react';
import type { MemoryProfile } from '../services/memoryProfile';

interface MemoryProfileModalProps {
    isOpen: boolean;
    profile: MemoryProfile;
    onClose: () => void;
    onSave: (profile: MemoryProfile) => void;
}

const MemoryProfileModal: React.FC<MemoryProfileModalProps> = ({ isOpen, profile, onClose, onSave }) => {
    const [draft, setDraft] = useState(profile);

    React.useEffect(() => {
        if (isOpen) setDraft(profile);
    }, [isOpen, profile]);

    const updateField = (field: keyof MemoryProfile, value: string) => {
        setDraft((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md"
                    onMouseDown={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="w-full max-w-lg rounded-2xl border border-white/10 bg-dark-lighter p-5 shadow-2xl"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                    <Brain className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Memori rizki</h2>
                                    <p className="text-xs text-gray-400">Atur preferensi yang boleh diingat.</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-400">Nama panggilan</span>
                                <input
                                    value={draft.name}
                                    onChange={(event) => updateField('name', event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/60"
                                    placeholder="Contoh: Rizki"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-400">Gaya bicara</span>
                                <input
                                    value={draft.preferredTone}
                                    onChange={(event) => updateField('preferredTone', event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/60"
                                    placeholder="Santai, teknis, lucu, formal..."
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-400">Minat atau konteks</span>
                                <textarea
                                    value={draft.interests}
                                    onChange={(event) => updateField('interests', event.target.value)}
                                    className="min-h-24 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/60"
                                    placeholder="Contoh: sedang belajar React, suka astronomi, butuh jawaban bahasa Indonesia."
                                />
                            </label>

                            <label className="block">
                                <span className="mb-1 block text-xs font-medium text-gray-400">Format jawaban favorit</span>
                                <input
                                    value={draft.responseStyle}
                                    onChange={(event) => updateField('responseStyle', event.target.value)}
                                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-primary/60"
                                    placeholder="Ringkas, bullet point, langkah demi langkah..."
                                />
                            </label>
                        </div>

                        <div className="mt-5 flex justify-end gap-2">
                            <button onClick={onClose} className="rounded-xl px-4 py-2 text-sm text-gray-300 hover:bg-white/5">
                                Batal
                            </button>
                            <button
                                onClick={() => {
                                    onSave(draft);
                                    onClose();
                                }}
                                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                            >
                                <Save className="h-4 w-4" />
                                Simpan
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MemoryProfileModal;
