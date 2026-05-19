import { useEffect, useRef, useState } from 'react';
import HorrorSoundGenerator from '../utils/audioGenerator';

export type SoundEffect =
    | 'ambient'
    | 'heartbeat'
    | 'scream'
    | 'breath'
    | 'drip'
    | 'footsteps'
    | 'door_creak'
    | 'glitch';

export const useHorrorSound = () => {
    const [isMuted, setIsMuted] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const generatorRef = useRef<HorrorSoundGenerator | null>(null);
    const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const activeSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());

    // Initialize audio generator
    useEffect(() => {
        try {
            generatorRef.current = new HorrorSoundGenerator();
            setIsLoaded(true);
        } catch (err) {
            console.warn('Failed to initialize audio generator:', err);
        }

        // Cleanup on unmount
        return () => {
            if (ambientSourceRef.current) {
                generatorRef.current?.stopSound(ambientSourceRef.current);
            }
            activeSourcesRef.current.forEach(source => {
                generatorRef.current?.stopSound(source);
            });
        };
    }, []);

    const playSound = (effect: SoundEffect, options?: { loop?: boolean; volume?: number }) => {
        if (!isLoaded || !generatorRef.current || isMuted) return;

        const volume = options?.volume !== undefined ? options.volume : 0.6;
        const loop = options?.loop || false;

        // Stop previous instance of this sound if not looping
        if (!loop && activeSourcesRef.current.has(effect)) {
            const oldSource = activeSourcesRef.current.get(effect);
            generatorRef.current.stopSound(oldSource!);
            activeSourcesRef.current.delete(effect);
        }

        const source = generatorRef.current.playSound(effect, { volume, loop });
        if (source && !loop) {
            activeSourcesRef.current.set(effect, source);
            // Auto-remove after playback
            setTimeout(() => {
                activeSourcesRef.current.delete(effect);
            }, 5000);
        }
    };

    const stopSound = (effect: SoundEffect) => {
        const source = activeSourcesRef.current.get(effect);
        if (source && generatorRef.current) {
            generatorRef.current.stopSound(source);
            activeSourcesRef.current.delete(effect);
        }
    };

    const startAmbient = () => {
        if (!isLoaded || !generatorRef.current || isMuted) return;

        // Stop old ambient if exists
        if (ambientSourceRef.current) {
            generatorRef.current.stopSound(ambientSourceRef.current);
        }

        ambientSourceRef.current = generatorRef.current.playSound('ambient', {
            volume: 0.25,
            loop: true
        });
    };

    const stopAmbient = () => {
        if (ambientSourceRef.current && generatorRef.current) {
            generatorRef.current.stopSound(ambientSourceRef.current);
            ambientSourceRef.current = null;
        }
    };

    const toggleMute = () => {
        setIsMuted(prev => {
            const newMuted = !prev;
            if (newMuted) {
                // Stop all sounds when muting
                stopAmbient();
                activeSourcesRef.current.forEach(source => {
                    generatorRef.current?.stopSound(source);
                });
                activeSourcesRef.current.clear();
            }
            return newMuted;
        });
    };

    return {
        playSound,
        stopSound,
        startAmbient,
        stopAmbient,
        toggleMute,
        isMuted,
        isLoaded,
    };
};
