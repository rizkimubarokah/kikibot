// Web Audio API Horror Sound Generator
// Generates horror sounds programmatically without needing audio files

export interface AudioConfig {
    volume: number;
    loop?: boolean;
}

class HorrorSoundGenerator {
    private audioContext: AudioContext | null = null;
    private sounds: Map<string, AudioBuffer> = new Map();

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.generateAllSounds();
        }
    }

    private generateAllSounds() {
        if (!this.audioContext) return;

        // Generate each sound type
        this.sounds.set('ambient', this.generateAmbientDrone());
        this.sounds.set('heartbeat', this.generateHeartbeat());
        this.sounds.set('scream', this.generateScream());
        this.sounds.set('breath', this.generateBreathing());
        this.sounds.set('drip', this.generateDrip());
        this.sounds.set('footsteps', this.generateFootsteps());
        this.sounds.set('door_creak', this.generateDoorCreak());
        this.sounds.set('glitch', this.generateGlitch());
    }

    private generateAmbientDrone(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 10; // 10 seconds loop
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Low frequency drone with slow modulation
                const freq1 = 40 + Math.sin(t * 0.5) * 10;
                const freq2 = 60 + Math.sin(t * 0.3) * 15;
                data[i] = (Math.sin(2 * Math.PI * freq1 * t) + Math.sin(2 * Math.PI * freq2 * t)) * 0.15;
            }
        }
        return buffer;
    }

    private generateHeartbeat(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 2; // 2 second heartbeat cycle
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Two bass hits
                const beat1 = Math.exp(-t * 20) * Math.sin(2 * Math.PI * 60 * t);
                const beat2 = t > 0.15 ? Math.exp(-(t - 0.15) * 25) * Math.sin(2 * Math.PI * 55 * (t - 0.15)) : 0;
                data[i] = (beat1 + beat2) * 0.8;
            }
        }
        return buffer;
    }

    private generateScream(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 1.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // High-pitched screech that sweeps up
                const freq = 800 + t * 1200;
                const envelope = Math.exp(-t * 2);
                // Add some distortion with sine clipping
                let sample = Math.sin(2 * Math.PI * freq * t) * envelope;
                sample = Math.max(-0.8, Math.min(0.8, sample * 2)); // Clip for distortion
                data[i] = sample * 0.5;
            }
        }
        return buffer;
    }

    private generateBreathing(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 4;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Filtered noise with breathing envelope
                const noise = (Math.random() * 2 - 1) * 0.3;
                const breathCycle = Math.sin(2 * Math.PI * 0.25 * t); // 4 second cycle
                const envelope = Math.max(0, breathCycle) * 0.5;
                // Low-pass filter simulation
                const filtered = noise * envelope * (200 / (200 + t * 100));
                data[i] = filtered;
            }
        }
        return buffer;
    }

    private generateDrip(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 0.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Frequency sweep down with sharp decay
                const freq = 800 * Math.exp(-t * 8);
                const envelope = Math.exp(-t * 15);
                data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.6;
            }
        }
        return buffer;
    }

    private generateFootsteps(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 2;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Three footstep sounds with noise bursts
                let sample = 0;
                const steps = [0, 0.6, 1.2];
                for (const stepTime of steps) {
                    if (t > stepTime && t < stepTime + 0.1) {
                        const relT = t - stepTime;
                        const noise = (Math.random() * 2 - 1) * Math.exp(-relT * 30);
                        const thud = Math.sin(2 * Math.PI * 80 * relT) * Math.exp(-relT * 20);
                        sample += noise * 0.3 + thud * 0.7;
                    }
                }
                data[i] = sample * 0.5;
            }
        }
        return buffer;
    }

    private generateDoorCreak(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 2.5;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Slow frequency sweep with vibrato
                const baseFreq = 180 + t * 50;
                const vibrato = Math.sin(2 * Math.PI * 5 * t) * 10;
                const freq = baseFreq + vibrato;
                const envelope = 0.3 + Math.sin(t * 2) * 0.2;
                data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
            }
        }
        return buffer;
    }

    private generateGlitch(): AudioBuffer {
        if (!this.audioContext) throw new Error('No audio context');

        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel);
            for (let i = 0; i < data.length; i++) {
                const t = i / sampleRate;
                // Randomized digital noise with pitch jumps
                const freq = Math.random() > 0.9 ? Math.random() * 1000 + 200 : 400;
                const noise = (Math.random() * 2 - 1) * 0.5;
                const tone = Math.sin(2 * Math.PI * freq * t) * 0.5;
                const envelope = Math.exp(-t * 3);
                data[i] = (noise + tone) * envelope * 0.4;
            }
        }
        return buffer;
    }

    playSound(soundName: string, config: AudioConfig = { volume: 1, loop: false }) {
        if (!this.audioContext || !this.sounds.has(soundName)) {
            console.warn(`Sound not found: ${soundName}`);
            return null;
        }

        const buffer = this.sounds.get(soundName)!;
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        source.loop = config.loop || false;
        gainNode.gain.value = config.volume;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
        return source;
    }

    stopSound(source: AudioBufferSourceNode | null) {
        if (source) {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        }
    }
}

export default HorrorSoundGenerator;
