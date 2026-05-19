import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import rizkiImg from '../assets/rizki.png';

const LandingScene: React.FC = () => {
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: string; duration: string }[]>([]);
    const [asteroids, setAsteroids] = useState<{ id: number; duration: string; delay: string; left: string }[]>([]);
    const [shootingStars, setShootingStars] = useState<{ id: number; duration: string; delay: string; top: string; left: string }[]>([]);

    useEffect(() => {
        const newStars = Array.from({ length: 40 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: `${Math.random() * 2 + 1}px`,
            duration: `${Math.random() * 3 + 2}s`
        }));
        setStars(newStars);

        const newAsteroids = Array.from({ length: 3 }).map((_, i) => ({
            id: i,
            duration: `${Math.random() * 5 + 10}s`,
            delay: `${Math.random() * 20}s`,
            left: `${Math.random() * 100}%`
        }));
        setAsteroids(newAsteroids);

        const newShootingStars = Array.from({ length: 4 }).map((_, i) => ({
            id: i,
            duration: `${Math.random() * 1.5 + 1.5}s`,
            delay: `${Math.random() * 25}s`,
            top: `${Math.random() * 40}%`,
            left: `${Math.random() * 80 + 20}%`
        }));
        setShootingStars(newShootingStars);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-[#020617] via-[#0f1035] to-[#1e1b4b] z-0 flex items-center justify-center p-4">
            {/* Background Decorative Planets */}
            <div className="absolute top-[-5%] right-[-5%] w-[40vw] h-[40vw] bg-purple-600/5 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-[-5%] left-[-5%] w-[35vw] h-[35vw] bg-blue-600/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Star Particles */}
            {stars.map((star) => (
                <div
                    key={star.id}
                    className="star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        '--duration': star.duration
                    } as React.CSSProperties}
                />
            ))}

            {/* Shooting Stars */}
            {shootingStars.map((ss) => (
                <div
                    key={ss.id}
                    className="shooting-star"
                    style={{
                        top: ss.top,
                        left: ss.left,
                        '--duration': ss.duration,
                        '--delay': ss.delay
                    } as React.CSSProperties}
                />
            ))}

            {/* Falling Asteroids */}
            {asteroids.map((ast) => (
                <div
                    key={ast.id}
                    className="asteroid"
                    style={{
                        left: ast.left,
                        '--duration': ast.duration,
                        '--delay': ast.delay
                    } as React.CSSProperties}
                />
            ))}

            {/* rizki Content Container */}
            <div className="relative z-10 flex flex-col items-center max-w-full w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, type: 'spring', bounce: 0.3 }}
                    className="relative flex items-center justify-center"
                >
                    {/* Edge Smoothing Container */}
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-visible">
                        {/* Blending Mask - Fades the edges of the image */}
                        <div
                            className="absolute inset-0 z-10 pointer-events-none"
                            style={{
                                background: 'radial-gradient(circle at center, transparent 30%, #0f1035 70%)',
                                mixBlendMode: 'normal'
                            }}
                        ></div>

                        {/* Main rizki Image */}
                        <img
                            src={rizkiImg}
                            alt="rizki"
                            className="w-full h-full object-contain animate-float drop-shadow-[0_0_20px_rgba(147,197,253,0.2)] mix-blend-screen relative z-0"
                            style={{
                                maskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)',
                                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 85%)'
                            }}
                        />
                    </div>

                    {/* Orbiting Elements */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] border border-white/5 rounded-full pointer-events-none"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-purple-400/30 blur-sm rounded-full"></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-300/40 blur-[1px] rounded-full delay-500"></div>
                    </motion.div>

                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-[350px] h-[350px] md:w-[480px] md:h-[480px] border border-white/[0.03] rounded-full pointer-events-none"
                    >
                        <div className="absolute top-1/4 right-0 w-3 h-3 bg-yellow-200/20 blur-[2px] rounded-full"></div>
                    </motion.div>

                    {/* Glowing Aura Background */}
                    <div className="absolute inset-0 bg-blue-500/10 blur-[80px] -z-10 rounded-full animate-pulse"></div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="text-center mt-6 md:mt-10 px-4 w-full"
                >
                    <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full mb-4 md:mb-6 backdrop-blur-xl">
                        <span className="text-blue-300 text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Galaxy Protocol Active</span>
                    </div>

                    <div className="space-y-1 md:space-y-3">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter drop-shadow-2xl">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-white to-purple-400 italic">rizki</span>
                        </h1>
                        <p className="text-blue-200/60 text-sm md:text-lg lg:text-xl font-light tracking-[0.4em] uppercase max-w-lg mx-auto overflow-hidden text-ellipsis whitespace-nowrap px-4">
                            Asisten Virtual
                        </p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 2 }}
                        className="mt-8 md:mt-12 py-4 border-t border-white/5 max-w-xs mx-auto"
                    >
                        <p className="text-blue-300/40 text-[10px] md:text-xs italic leading-relaxed">
                            "Siap membantu eksplorasi data Anda tanpa batas ruang hampa."
                        </p>
                    </motion.div>
                </motion.div>
            </div>

            {/* Decorative HUD Elements */}
            <div className="absolute top-10 left-10 w-24 h-24 border-l border-t border-white/10 opacity-20 pointer-events-none hidden md:block"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 border-r border-b border-white/10 opacity-20 pointer-events-none hidden md:block"></div>
        </div>
    );
};

export default LandingScene;
