import React from 'react';
import { History, MessageSquare, TrendingUp } from 'lucide-react';
import type { Message } from '../types';

interface ContextSuggestionsProps {
    messages: Message[];
    onSelectSuggestion: (text: string) => void;
}

const ContextSuggestions: React.FC<ContextSuggestionsProps> = ({ messages, onSelectSuggestion }) => {
    const extractTopics = (): string[] => {
        const topics = new Set<string>();

        // Get last 10 messages
        const recentMessages = messages.slice(-10);

        recentMessages.forEach(msg => {
            const text = msg.text.toLowerCase();

            // Extract topics based on keywords
            if (text.includes('cuaca') || text.includes('weather')) topics.add('Cuaca');
            if (text.includes('game') || text.includes('bermain')) topics.add('Games');
            if (text.includes('gambar') || text.includes('image')) topics.add('Generasi Gambar');
            if (text.includes('black hole') || text.includes('bintang') || text.includes('planet')) topics.add('Astronomi');
            if (text.includes('code') || text.includes('kode') || text.includes('program')) topics.add('Programming');
            if (text.includes('musik') || text.includes('lagu') || text.includes('music')) topics.add('Musik');
        });

        return Array.from(topics).slice(0, 5);
    };

    const generateFollowUps = (): string[] => {
        const topics = extractTopics();
        const followUps: string[] = [];

        topics.forEach(topic => {
            if (topic === 'Cuaca') followUps.push('Prediksi cuaca minggu depan?');
            if (topic === 'Games') followUps.push('Game apa yang paling seru?');
            if (topic === 'Generasi Gambar') followUps.push('Generate gambar abstrak');
            if (topic === 'Astronomi') followUps.push('Jelaskan tentang galaksi');
            if (topic === 'Programming') followUps.push('Tips belajar coding untuk pemula');
            if (topic === 'Musik') followUps.push('Rekomendasikan musik santai');
        });

        // Add general suggestions if none
        if (followUps.length === 0) {
            followUps.push('Ceritakan fakta unik hari ini');
            followUps.push('Apa yang bisa kamu bantu?');
        }

        return followUps.slice(0, 4);
    };

    const topics = extractTopics();
    const suggestions = generateFollowUps();

    if (messages.length <= 1) return null; // Don't show if no conversation yet

    return (
        <div className="space-y-4 px-4 py-3">
            {/* Recent Topics */}
            {topics.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <History className="w-4 h-4 text-blue-400" />
                        <h3 className="text-xs font-bold text-blue-300 uppercase tracking-wider">Topik Terbaru</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {topics.map((topic, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-200"
                            >
                                {topic}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Questions */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">Saran Pertanyaan</h3>
                </div>
                <div className="space-y-2">
                    {suggestions.map((suggestion, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSelectSuggestion(suggestion)}
                            className="w-full text-left px-3 py-2 text-xs bg-dark-lighter/50 hover:bg-dark-lighter border border-white/5 rounded-lg text-gray-300 hover:text-white transition-all flex items-start gap-2 group"
                        >
                            <MessageSquare className="w-3 h-3 text-gray-500 group-hover:text-purple-400 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContextSuggestions;
