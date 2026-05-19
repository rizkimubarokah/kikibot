
import React, { useEffect, useState } from 'react';
import { checkDueReminders, markReminderComplete, type Reminder } from '../services/reminderService';
import { speakText } from '../services/voiceService';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationManager: React.FC = () => {
    const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const due = checkDueReminders();
            if (due.length > 0) {
                // Determine new reminders that popped up just now
                due.forEach(reminder => {
                    // Check if already shown in active list to avoid spamming voice
                    setActiveReminders(prev => {
                        if (prev.find(r => r.id === reminder.id)) return prev;

                        // New Reminder triggered!
                        const alertPhrases = [
                            `Halo! Maaf mengganggu, tapi sudah waktunya untuk ${reminder.text}. Jangan lupa ya!`,
                            `Ding dong! Pengingat untukmu: ${reminder.text}. Segera lakukan ya!`,
                            `Woy! Udah jamnya nih. Waktunya ${reminder.text}. Semangat!`,
                            `Perhatian, perhatian. Ada jadwal penting: ${reminder.text}.`
                        ];
                        const randomPhrase = alertPhrases[Math.floor(Math.random() * alertPhrases.length)];

                        speakText(randomPhrase);
                        // Mark as complete in storage right away so it doesn't re-trigger on reload
                        // BUT we keep it in activeReminders state to show the UI
                        markReminderComplete(reminder.id);
                        return [...prev, reminder];
                    });
                });
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const dismiss = (id: string) => {
        setActiveReminders(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="fixed top-24 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {activeReminders.map(reminder => (
                    <motion.div
                        key={reminder.id}
                        initial={{ opacity: 0, x: 100, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100 }}
                        className="pointer-events-auto bg-dark-lighter/90 backdrop-blur-md border border-primary/50 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 w-80 relative overflow-hidden group"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-primary/10 animate-pulse-red pointer-events-none" />

                        <div className="bg-primary/20 p-2 rounded-full relative z-10 text-primary">
                            <Bell className="w-6 h-6 animate-bounce" />
                        </div>

                        <div className="flex-1 relative z-10">
                            <h4 className="font-bold text-sm text-primary mb-1">Pengingat!</h4>
                            <p className="text-sm font-medium leading-relaxed">{reminder.text}</p>
                            <p className="text-xs text-gray-400 mt-2">Baru saja</p>
                        </div>

                        <button
                            onClick={() => dismiss(reminder.id)}
                            className="text-gray-400 hover:text-white transition-colors relative z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationManager;
