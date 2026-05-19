import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2, Image, Cloud, Calculator, Lightbulb } from 'lucide-react';

interface QuickRepliesProps {
    lastBotMessage?: string;
    onSelectReply: (text: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ lastBotMessage, onSelectReply }) => {
    const generateSuggestions = (): { text: string; icon: React.ReactNode }[] => {
        if (!lastBotMessage) return [];

        const suggestions: { text: string; icon: React.ReactNode }[] = [];
        const msg = lastBotMessage.toLowerCase();

        // Weather-related
        if (msg.includes('cuaca') || msg.includes('hujan') || msg.includes('panas')) {
            suggestions.push({ text: 'Cuaca besok gimana?', icon: <Cloud className="w-3 h-3" /> });
            suggestions.push({ text: 'Cek cuaca Jakarta', icon: <Cloud className="w-3 h-3" /> });
        }

        // Game-related
        if (msg.includes('game') || msg.includes('main') || msg.includes('bermain')) {
            suggestions.push({ text: 'Main game lain dong', icon: <Gamepad2 className="w-3 h-3" /> });
            suggestions.push({ text: 'Rekomendasi game seru?', icon: <Gamepad2 className="w-3 h-3" /> });
        }

        // Image generation
        if (msg.includes('gambar') || msg.includes('image') || msg.includes('generate')) {
            suggestions.push({ text: 'Buat gambar lagi yuk', icon: <Image className="w-3 h-3" /> });
            suggestions.push({ text: 'Generate pemandangan gunung', icon: <Image className="w-3 h-3" /> });
        }

        // Science/Knowledge
        if (msg.includes('black hole') || msg.includes('lubang hitam') || msg.includes('bintang') || msg.includes('planet')) {
            suggestions.push({ text: 'Ceritakan tentang bintang neutron', icon: <Sparkles className="w-3 h-3" /> });
            suggestions.push({ text: 'Apa itu galaksi?', icon: <Sparkles className="w-3 h-3" /> });
        }

        // Math/Calculation
        if (msg.includes('hitung') || msg.includes('matematika') || msg.includes('rumus')) {
            suggestions.push({ text: 'Hitung sesuatu lagi', icon: <Calculator className="w-3 h-3" /> });
            suggestions.push({ text: 'Jelaskan teorema pythagoras', icon: <Calculator className="w-3 h-3" /> });
        }

        // Default/General suggestions if no specific context
        if (suggestions.length === 0) {
            suggestions.push({ text: 'Ceritakan fakta menarik', icon: <Lightbulb className="w-3 h-3" /> });
            suggestions.push({ text: 'Apa yang bisa kamu lakukan?', icon: <Sparkles className="w-3 h-3" /> });
        }

        // Limit to 3 suggestions
        return suggestions.slice(0, 3);
    };

    const suggestions = generateSuggestions();

    if (suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap gap-2 px-4 mb-4"
        >
            {suggestions.map((suggestion, index) => (
                <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelectReply(suggestion.text)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-400/30 rounded-full text-blue-200 transition-all backdrop-blur-sm"
                >
                    {suggestion.icon}
                    {suggestion.text}
                </motion.button>
            ))}
        </motion.div>
    );
};

export default QuickReplies;
