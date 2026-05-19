
// Web Audio API Synthetic Sound Generator
// No external files needed!

class SoundManager {
    private ctx: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        try {
            // Initialize AudioContext on user interaction usually, but we define it here
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass();
        } catch (e) {
            console.error("Web Audio API not supported", e);
        }
    }

    private ensureContext() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new AudioContextClass();
        }
        if (this.ctx?.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMute(mute: boolean) {
        this.isMuted = mute;
    }

    play(type: 'pop' | 'cling' | 'sad' | 'angry') {
        try {
            if (this.isMuted || !this.ctx) return;
            this.ensureContext();

            const t = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            if (type === 'pop') {
                // Message IN sound: Soft Pop (Bubble)
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, t);
                osc.frequency.exponentialRampToValueAtTime(400, t + 0.1);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
                osc.start(t);
                osc.stop(t + 0.1);
            }
            else if (type === 'cling') {
                // Happpy/Success: High Chime
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(1800, t + 0.2);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.5);

                // Add a second harmonic for richness
                const osc2 = this.ctx.createOscillator();
                const gain2 = this.ctx.createGain();
                osc2.connect(gain2);
                gain2.connect(this.ctx.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(600, t);
                gain2.gain.setValueAtTime(0.05, t);
                gain2.gain.linearRampToValueAtTime(0, t + 0.5);

                osc.start(t); osc.stop(t + 0.5);
                osc2.start(t); osc2.stop(t + 0.5);
            }
            else if (type === 'angry') {
                // Angry: Low Sawtooth Buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, t);
                osc.frequency.linearRampToValueAtTime(80, t + 0.3);
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.3);
                osc.start(t);
                osc.stop(t + 0.3);
            }
            else if (type === 'sad') {
                // Sad: Minor fade
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, t); // D4
                osc.frequency.linearRampToValueAtTime(280, t + 1);
                gain.gain.setValueAtTime(0.05, t);
                gain.gain.linearRampToValueAtTime(0, t + 1);
                osc.start(t);
                osc.stop(t + 1);
            }
        } catch (e) {
            console.error("Sound playback error:", e);
        }
    }
}

export const soundManager = new SoundManager();
