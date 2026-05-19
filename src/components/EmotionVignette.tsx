
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Emotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';

interface EmotionVignetteProps {
    emotion: Emotion;
}

const EmotionVignette: React.FC<EmotionVignetteProps> = ({ emotion }) => {
    // Generate random positions for particles when emotion changes
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; scale: number; char: string }[]>([]);

    useEffect(() => {
        if (emotion === 'neutral') {
            setParticles([]);
            return;
        }

        const count = 15; // Number of particles
        const newParticles = [];

        let chars = [''];
        if (emotion === 'happy') chars = ['🌸', '🌺', '🌻', '✨', '💖'];
        if (emotion === 'sad') chars = ['💧', '💙', '🌧️'];
        if (emotion === 'angry') chars = ['🤬', '💢', '😡', '💥'];
        if (emotion === 'surprised') chars = ['😱', '❗', '⚡'];

        for (let i = 0; i < count; i++) {
            newParticles.push({
                id: i,
                x: Math.random() * 100, // %
                y: Math.random() * 100, // %
                delay: Math.random() * 0.5,
                scale: 0.8 + Math.random() * 0.5,
                char: chars[Math.floor(Math.random() * chars.length)]
            });
        }

        setParticles(newParticles);
    }, [emotion]);

    return (
        <AnimatePresence>
            {emotion !== 'neutral' && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
                >

                    {/* ANGRY: Red Flash + Shake */}
                    {emotion === 'angry' && (
                        <motion.div
                            initial={{ backgroundColor: 'rgba(220, 38, 38, 0)' }}
                            animate={{ backgroundColor: ['rgba(220, 38, 38, 0)', 'rgba(220, 38, 38, 0.2)', 'rgba(220, 38, 38, 0)'] }}
                            transition={{ duration: 0.5, repeat: Infinity }}
                            className="absolute inset-0"
                        >
                            {particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    className="absolute text-5xl"
                                    initial={{ x: `${p.x}vw`, y: `${p.y}vh`, scale: 0 }}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        x: [`${p.x}vw`, `${p.x - 1}vw`, `${p.x + 1}vw`, `${p.x}vw`], // Shake
                                        rotate: [0, -10, 10, 0]
                                    }}
                                    transition={{ duration: 0.2, repeat: Infinity, delay: p.delay }}
                                >
                                    {p.char}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* SAD: Rain Overlay & Blue Tint */}
                    {emotion === 'sad' && (
                        <motion.div
                            initial={{ backgroundColor: 'rgba(30, 58, 138, 0)' }}
                            animate={{ backgroundColor: 'rgba(30, 58, 138, 0.3)' }}
                            exit={{ backgroundColor: 'rgba(30, 58, 138, 0)' }}
                            className="absolute inset-0 backdrop-blur-[2px]"
                        >
                            {particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    className="absolute text-3xl opacity-70"
                                    initial={{ x: `${p.x}vw`, y: -10 }}
                                    animate={{ y: '110vh' }}
                                    transition={{
                                        duration: 1.5 + Math.random(),
                                        repeat: Infinity,
                                        ease: "linear",
                                        delay: p.delay
                                    }}
                                >
                                    💧
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* HAPPY: Warm Glow & Floating Flowers */}
                    {emotion === 'happy' && (
                        <motion.div
                            initial={{ backgroundColor: 'rgba(234, 179, 8, 0)' }}
                            animate={{ backgroundColor: 'rgba(234, 179, 8, 0.15)' }}
                            exit={{ backgroundColor: 'rgba(234, 179, 8, 0)' }}
                            className="absolute inset-0"
                        >
                            {particles.map((p) => (
                                <motion.div
                                    key={p.id}
                                    className="absolute text-5xl"
                                    initial={{ x: `${p.x}vw`, y: `${p.y}vh`, scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, p.scale, p.scale * 0.8],
                                        opacity: [0, 1, 0],
                                        y: [`${p.y}vh`, `${p.y - 10}vh`] // Float up
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, delay: p.delay }}
                                >
                                    {p.char}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* SURPRISED: White Flash */}
                    {emotion === 'surprised' && (
                        <motion.div
                            initial={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}
                            animate={{ backgroundColor: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0)'] }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 2, 0] }}
                                transition={{ duration: 0.6 }}
                                className="text-9xl"
                            >
                                😱
                            </motion.span>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default EmotionVignette;
