import React, { useState, useEffect, useRef } from 'react';
import type { GameState } from './HorrorStoryData';
import { INITIAL_STATE, STORY_NODES } from './HorrorStoryData';
import { Heart, Skull, RotateCcw, Eye, Clock, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';

// Assets
import basementBg from '../../assets/games/horror/basement.png';
import sculptorImg from '../../assets/games/horror/sculptor.png';

const HorrorNovel: React.FC = () => {
    const [currentNodeId, setCurrentNodeId] = useState<string>('start');
    const [state, setState] = useState<GameState>(INITIAL_STATE);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [bgImage, setBgImage] = useState<string>(basementBg);

    const currentNode = STORY_NODES[currentNodeId];
    const audioCtxRef = useRef<AudioContext | null>(null);
    const droneOscRef = useRef<OscillatorNode | null>(null);

    // Audio Engine
    const initAudio = () => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
        setAudioEnabled(true);
        startDrone();
    };

    const stopAudio = () => {
        if (audioCtxRef.current) {
            audioCtxRef.current.close().then(() => {
                audioCtxRef.current = null;
                setAudioEnabled(false);
            });
        }
    };

    const startDrone = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;

        // Stop previous drone
        if (droneOscRef.current) {
            try { droneOscRef.current.stop(); } catch (e) { }
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low frequency drone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, ctx.currentTime);

        // LFO for throbbing effect
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2; // Slow pulse
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        gain.gain.setValueAtTime(0.02, ctx.currentTime); // Low volume

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        droneOscRef.current = osc;
    };

    const playSoundEffect = (type: 'heartbeat' | 'scream') => {
        if (!audioCtxRef.current || !audioEnabled) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'heartbeat') {
            osc.frequency.setValueAtTime(50, now);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'scream') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
        }
    };

    // Update Background Image based on node
    useEffect(() => {
        if (currentNodeId.includes('sculptor') || currentNodeId === 'manipulate_sculptor') {
            setBgImage(sculptorImg);
        } else {
            setBgImage(basementBg);
        }
    }, [currentNodeId]);

    // Typewriter Effect
    useEffect(() => {
        setDisplayedText('');
        setIsTyping(true);
        let index = 0;
        const text = currentNode.text;

        // Faster typing for longer text
        const speed = text.length > 200 ? 5 : 20;

        const timer = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text.charAt(index));
                index++;
            } else {
                clearInterval(timer);
                setIsTyping(false);
            }
        }, speed);

        // Play SFX based on bgEffect
        if (currentNode.bgEffect === 'heartbeat') playSoundEffect('heartbeat');
        if (currentNode.bgEffect === 'red-flash') playSoundEffect('scream');

        return () => clearInterval(timer);
    }, [currentNodeId]);

    const handleChoice = (nextNodeId: string, effect?: (s: GameState) => Partial<GameState>) => {
        if (effect) {
            setState(prev => ({ ...prev, ...effect(prev) }));
        }
        setCurrentNodeId(nextNodeId);
    };

    const restartGame = () => {
        setState(INITIAL_STATE);
        setCurrentNodeId('start');
    };

    // Get dynamic background class for CSS animations
    const getBgEffectClass = () => {
        switch (currentNode.bgEffect) {
            case 'red-flash': return 'animate-pulse bg-red-900/40 mix-blend-overlay';
            case 'glitch': return 'animate-pulse bg-gray-900/50 mix-blend-difference';
            case 'heartbeat': return 'animate-ping opacity-20 bg-red-500';
            case 'shake': return 'animate-shake';
            default: return '';
        }
    };

    return (
        <div className="w-full h-full min-h-[85vh] flex flex-col relative overflow-hidden font-serif bg-black text-white select-none">

            {/* Background Image Layer */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${state.sanity < 30 ? 'animate-pulse' : ''}`}>
                <img
                    src={bgImage}
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black"></div>

                {/* Visual Noise CSS */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
                </div>
            </div>

            {/* BG Effect Overlay */}
            <div className={`absolute inset-0 pointer-events-none z-0 ${getBgEffectClass()}`}></div>

            {/* Audio Toggle */}
            <button
                onClick={audioEnabled ? stopAudio : initAudio}
                className="absolute top-4 right-4 z-40 p-2 bg-black/50 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-white/10"
                title={audioEnabled ? "Mute Audio" : "Enable Audio"}
            >
                {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {/* Chapter Header */}
            {currentNode.chapter && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm"
                >
                    <h3 className="text-sm tracking-[0.3em] text-red-500 font-bold uppercase drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                        {currentNode.chapter}
                    </h3>
                </motion.div>
            )}

            {/* Main Content Area - Scrollable to prevent truncation */}
            <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar p-6 flex flex-col items-center">
                <div className="max-w-3xl w-full flex flex-col items-center pb-20">

                    {/* Character Speaker */}
                    {currentNode.characterSpeaking && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`self-start mb-2 px-3 py-1 bg-black/50 border-l-2 backdrop-blur-md ${currentNode.characterSpeaking === 'sculptor' ? 'border-red-600 text-red-500' :
                                currentNode.characterSpeaking === 'anna' ? 'border-purple-500 text-purple-400' :
                                    currentNode.characterSpeaking === 'marcus' ? 'border-blue-500 text-blue-400' :
                                        'border-gray-500 text-gray-300'
                                }`}
                        >
                            <span className="text-xs font-bold tracking-widest uppercase shadow-black drop-shadow-md">
                                {currentNode.characterSpeaking}
                            </span>
                        </motion.div>
                    )}

                    {/* Story Text Box */}
                    <motion.div
                        key={currentNodeId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full bg-black/60 backdrop-blur-md p-6 md:p-8 rounded-lg border border-white/5 shadow-2xl mb-8 min-h-[200px]"
                    >
                        <p className="text-lg md:text-xl leading-relaxed text-gray-200 whitespace-pre-line tracking-wide font-light drop-shadow-md">
                            {displayedText}
                            {isTyping && <span className="animate-pulse text-red-500 ml-1">|</span>}
                        </p>
                    </motion.div>

                    {/* Stats HUD (Compact) */}
                    <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-xs font-mono text-gray-400 border-t border-white/10 pt-4 bg-black/40 p-4 rounded-lg backdrop-blur-sm">
                        <div className={`flex items-center gap-2 ${state.sanity < 40 ? 'text-red-500 animate-pulse' : ''}`}>
                            <Heart className="w-4 h-4" /> SANITY: {state.sanity}%
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" /> ACT {state.act}
                        </div>
                        {state.hasWeapon && (
                            <div className="flex items-center gap-2 text-orange-400">
                                <Skull className="w-4 h-4" /> ARMED
                            </div>
                        )}
                        {state.discoveries.length > 0 && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Eye className="w-4 h-4" /> CLUES: {state.discoveries.length}
                            </div>
                        )}
                    </div>

                    {/* Choices Area */}
                    {!isTyping && (
                        <div className="w-full flex flex-col gap-3">
                            {currentNode.choices.length > 0 ? (
                                currentNode.choices.map((choice, idx) => (
                                    <motion.button
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        onClick={() => handleChoice(choice.nextNodeId, choice.effect)}
                                        disabled={choice.requiredState && !choice.requiredState(state)}
                                        className="relative group w-full text-left p-4 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-red-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed overflow-hidden shadow-lg"
                                    >
                                        <div className="absolute inset-0 bg-red-900/0 group-hover:bg-red-900/10 transition-colors" />
                                        <div className="relative flex items-start gap-4">
                                            <span className="text-red-500/50 group-hover:text-red-500 font-mono mt-1">
                                                0{idx + 1}
                                            </span>
                                            <span className="text-gray-300 group-hover:text-white font-medium">
                                                {choice.text}
                                            </span>

                                            {choice.timerSeconds && (
                                                <span className="ml-auto text-xs text-yellow-500 animate-pulse border border-yellow-500/50 px-2 py-1 rounded">
                                                    {choice.timerSeconds}s
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>
                                ))
                            ) : (
                                <button
                                    onClick={restartGame}
                                    className="w-full p-4 bg-red-900/50 hover:bg-red-800/50 border border-red-500 rounded text-red-100 font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(153,27,27,0.5)] hover:shadow-[0_0_30px_rgba(153,27,27,0.7)]"
                                >
                                    <RotateCcw className="w-5 h-5" /> RESTART STORY
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Vignette & Atmospheric Overlays */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_90%)] z-20"></div>

            {/* Sanity Low Effect */}
            {state.sanity < 30 && (
                <div className="absolute inset-0 pointer-events-none mix-blend-overlay z-30 animate-pulse bg-red-900/20"></div>
            )}
        </div>
    );
};

export default HorrorNovel;
