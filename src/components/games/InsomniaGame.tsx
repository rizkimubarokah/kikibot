import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Skull, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Game Assets
import hallwayImg from '../../assets/games/insomnia/hallway.png';
import monsterFarImg from '../../assets/games/insomnia/monster_far.png';
import monsterCloseImg from '../../assets/games/insomnia/monster_close.png';
import jumpscareImg from '../../assets/games/insomnia/jumpscare.png';

const WIN_TIME = 45; // seconds to survive

const InsomniaGame: React.FC = () => {
    const [gameState, setGameState] = useState<'menu' | 'playing' | 'jumpscare' | 'won'>('menu');
    const [lastResult, setLastResult] = useState<'none' | 'won' | 'lost'>('none');
    const [monsterStage, setMonsterStage] = useState<0 | 1 | 2>(0); // 0=none, 1=far, 2=close
    const [blinkMeter, setBlinkMeter] = useState(100);
    const [eyesClosed, setEyesClosed] = useState(false);
    const [timeLeft, setTimeLeft] = useState(WIN_TIME);
    const [message, setMessage] = useState('');

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
    };

    const playSound = (type: 'heartbeat' | 'screech' | 'breath') => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'screech') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } else if (type === 'heartbeat') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(60, ctx.currentTime);
            gain.gain.setValueAtTime(1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.2);
        }
    };

    const startBackgroundDrone = () => {
        if (!audioCtxRef.current) return;
        stopBackgroundDrone();
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(50, ctx.currentTime);
        gain.gain.value = 0.1;

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        droneOscRef.current = osc;
    };

    const stopBackgroundDrone = () => {
        if (droneOscRef.current) {
            droneOscRef.current.stop();
            droneOscRef.current = null;
        }
    };

    const triggerJumpscare = () => {
        setGameState('jumpscare');
        playSound('screech');
        stopBackgroundDrone();
        setTimeout(() => {
            setGameState('menu');
            setLastResult('lost');
        }, 3000);
    };

    const advanceMonster = () => {
        setMonsterStage(prev => {
            if (prev === 2) {
                triggerJumpscare();
                return 2;
            }
            playSound('heartbeat');
            return (prev + 1) as 0 | 1 | 2;
        });
    };

    // Game Loop
    useEffect(() => {
        if (gameState !== 'playing') return;

        const loop = setInterval(() => {
            // Timer
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('won');
                    setLastResult('won');
                    return 0;
                }
                return prev - 1;
            });

            // Blink Meter Logic
            if (!eyesClosed) {
                setBlinkMeter(prev => {
                    const next = prev - 4; // Drain rate
                    if (next <= 0) {
                        // Forced Blink
                        setEyesClosed(true);
                        return 0;
                    }
                    return next;
                });
            } else {
                setBlinkMeter(prev => Math.min(prev + 6, 100)); // Refill rate
            }

            // Monster Logic
            if (eyesClosed) {
                if (Math.random() < 0.2) { // 20% chance per tick to move when blinking
                    advanceMonster();
                }
            } else {
                if (Math.random() < 0.02) { // 2% chance when staring
                    advanceMonster();
                }
            }

        }, 100);

        return () => clearInterval(loop);
    }, [gameState, eyesClosed]);

    // Forced Eye Opening check
    useEffect(() => {
        if (blinkMeter <= 0 && !eyesClosed) {
            setEyesClosed(true);
            setMessage("EYES TOO DRY! FORCED BLINK!");
        }
        if (blinkMeter > 30 && eyesClosed && message === "EYES TOO DRY! FORCED BLINK!") {
            setMessage("");
        }
        // If monster is far and you open eyes, it stays. 
    }, [blinkMeter, eyesClosed]);

    const handleStart = () => {
        initAudio();
        startBackgroundDrone();
        setGameState('playing');
        setMonsterStage(0);
        setBlinkMeter(100);
        setTimeLeft(WIN_TIME);
        setMessage("");
        setLastResult('none');
    };

    // Input Handlers
    const handleTouchStart = () => {
        if (gameState === 'playing') setEyesClosed(true);
    };
    const handleTouchEnd = () => {
        if (gameState === 'playing' && blinkMeter > 0) setEyesClosed(false);
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && gameState === 'playing') setEyesClosed(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space' && gameState === 'playing') setEyesClosed(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameState]);

    // Render Assets
    const getBgImage = () => {
        if (gameState === 'jumpscare') return jumpscareImg;
        if (monsterStage === 0) return hallwayImg;
        if (monsterStage === 1) return monsterFarImg;
        if (monsterStage === 2) return monsterCloseImg;
        return hallwayImg;
    };

    return (
        <div
            className="w-full h-full min-h-[400px] bg-black text-white relative overflow-hidden select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
        >
            {/* Game Screen */}
            {gameState === 'playing' || gameState === 'jumpscare' ? (
                <>
                    {/* Visuals */}
                    <AnimatePresence mode='wait'>
                        {!eyesClosed || gameState === 'jumpscare' ? (
                            <motion.img
                                key={monsterStage}
                                src={getBgImage()}
                                initial={{ opacity: 0.8 }}
                                animate={{ opacity: 1, scale: gameState === 'jumpscare' ? 1.2 : 1 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-black z-10 flex items-center justify-center">
                                <span className="text-gray-500 text-sm animate-pulse">... blinking ...</span>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Red Vignette for low sanity */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                        boxShadow: `inset 0 0 ${100 - blinkMeter}px ${(100 - blinkMeter) / 2}px rgba(255,0,0,0.5)`
                    }} />

                    {/* HUD */}
                    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center text-red-500 font-mono font-bold">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>{timeLeft}s</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2">
                                {eyesClosed ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5" />}
                                <span>{Math.floor(blinkMeter)}%</span>
                            </div>
                            <div className="w-24 h-2 bg-gray-800 mt-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${blinkMeter < 30 ? 'bg-red-600' : 'bg-green-500'}`}
                                    style={{ width: `${blinkMeter}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Instructions / Message */}
                    <div className="absolute bottom-10 w-full text-center z-20">
                        <p className="text-white/50 text-xs mb-2">HOLD [SPACE] / TOUCH TO BLINK</p>
                        {message && <p className="text-red-500 font-bold bg-black/50 inline-block px-2">{message}</p>}
                    </div>
                </>
            ) : (
                // Menu / Win / Loose Screen
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-50 p-6 text-center">
                    <Skull className="w-16 h-16 text-red-600 mb-4 animate-bounce" />

                    <h2 className="text-3xl font-bold text-red-500 tracking-widest mb-2">INSOMNIA</h2>

                    {lastResult === 'won' && <p className="text-green-400 mb-4 text-xl">YOU SURVIVED THE NIGHT</p>}
                    {lastResult === 'lost' && <p className="text-red-500 mb-4 text-xl">THE WATCHER CAUGHT YOU</p>}

                    <p className="text-gray-400 text-sm mb-6 max-w-md">
                        Survive {WIN_TIME} seconds. Don't let your eyes dry out.<br />
                        Hold <b>SPACE</b> or <b>TOUCH</b> screen to blink & refill moisture.<br />
                        But remember... <b>IT MOVES WHEN YOU BLINK.</b>
                    </p>

                    <button
                        onClick={handleStart}
                        className="px-8 py-3 bg-red-900 hover:bg-red-800 border border-red-600 text-white rounded font-bold uppercase tracking-wider transition-all"
                    >
                        {lastResult === 'none' ? 'START NIGHTMARE' : 'TRY AGAIN'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default InsomniaGame;
