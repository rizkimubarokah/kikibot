// Text to Speech - Instant Web Speech API (Google TTS - No delay)
let currentUtterance: SpeechSynthesisUtterance | null = null;

export const speakText = async (text: string, isMuted: boolean = false) => {
    // Stop any current speech
    stopSpeaking();

    if (isMuted || !text || text.trim().length === 0) {
        return;
    }

    if (!window.speechSynthesis) {
        console.warn('🎤 [TTS] Speech synthesis not supported');
        return;
    }

    try {
        // Clean text (remove markdown, emojis, emotion tags)
        const cleanText = text
            .replace(/[#*_`~]/g, '') // Remove markdown
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Remove emojis
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
            .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '')
            .replace(/\[EMOTION:\w+\]/gi, '') // Remove emotion tags
            .trim();

        if (cleanText.length === 0) return;

        currentUtterance = new SpeechSynthesisUtterance(cleanText);

        // Configure for Indonesian
        currentUtterance.lang = 'id-ID';
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;
        currentUtterance.volume = 0.9;

        // Try to get Indonesian voice
        const voices = window.speechSynthesis.getVoices();
        const indonesianVoice = voices.find(v =>
            v.lang.includes('id') || v.lang.includes('ID')
        );

        if (indonesianVoice) {
            currentUtterance.voice = indonesianVoice;
        }

        currentUtterance.onend = () => {
            currentUtterance = null;
            console.log('🎤 [TTS] Speech ended');
        };

        currentUtterance.onerror = (e) => {
            console.error('🎤 [TTS] Speech error:', e);
            currentUtterance = null;
        };

        window.speechSynthesis.speak(currentUtterance);
        console.log('🎤 [TTS] Playing instant Google TTS');

    } catch (error) {
        console.error('🎤 [TTS] Error:', error);
    }
};

export const stopSpeaking = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (currentUtterance) {
        currentUtterance = null;
    }
};

// ... keep SpeechRecognizer class if needed ...
export class SpeechRecognizer {
    private recognition: any;
    private isListening: boolean = false;

    static isSupported(): boolean {
        return typeof window !== 'undefined' && (
            'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
        );
    }

    constructor() {
        if (SpeechRecognizer.isSupported()) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.lang = 'id-ID';
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
        }
    }

    start(
        onResult: (text: string, isFinal: boolean) => void,
        onError: (err: any) => void,
        onEnd?: () => void
    ) {
        if (!this.recognition) {
            onError("Browser ini belum mendukung input suara.");
            return;
        }

        if (this.isListening) return;

        this.recognition.onresult = (event: any) => {
            let transcript = "";
            let isFinal = false;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) isFinal = true;
            }

            onResult(transcript.trim(), isFinal);
        };

        this.recognition.onerror = (event: any) => {
            const messages: Record<string, string> = {
                'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon di browser lalu coba lagi.',
                'no-speech': 'Tidak ada suara yang terdengar. Coba bicara sedikit lebih dekat ke mikrofon.',
                'audio-capture': 'Mikrofon tidak ditemukan atau sedang dipakai aplikasi lain.',
                'network': 'Layanan pengenal suara sedang bermasalah.'
            };

            onError(messages[event.error] || event.error || 'Input suara gagal.');
            this.isListening = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            onEnd?.();
        };

        try {
            this.recognition.start();
            this.isListening = true;
        } catch (error) {
            this.isListening = false;
            onError(error);
            onEnd?.();
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }
}
