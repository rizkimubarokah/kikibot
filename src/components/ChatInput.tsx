import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Send, Square, Paperclip, Camera, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { SpeechRecognizer } from '../services/voiceService';

interface ChatInputProps {
    onSendMessage: (text: string, file?: File) => void;
    onStopResponse: () => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onStopResponse, isLoading }) => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [interimTranscript, setInterimTranscript] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const cameraInputRef = React.useRef<HTMLInputElement>(null);
    const speechRecognizer = React.useRef(new SpeechRecognizer());
    const isSpeechSupported = SpeechRecognizer.isSupported();

    useEffect(() => {
        return () => {
            speechRecognizer.current.stop();
        };
    }, []);

    useEffect(() => {
        if (!selectedFile || !selectedFile.type.startsWith('image/')) {
            setPreviewUrl(null);
            return;
        }

        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);

        return () => URL.revokeObjectURL(url);
    }, [selectedFile]);

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const toggleListening = () => {
        setVoiceError(null);

        if (!isSpeechSupported) {
            setVoiceError('Browser ini belum mendukung input suara. Coba gunakan Chrome atau Edge.');
            return;
        }

        if (isListening) {
            speechRecognizer.current.stop();
            setIsListening(false);
            setInterimTranscript('');
            return;
        }

        setIsListening(true);
        speechRecognizer.current.start(
            (text, isFinal) => {
                if (!text) return;

                if (isFinal) {
                    setInput((prev) => `${prev}${prev.trim() ? ' ' : ''}${text}`.trimStart());
                    setInterimTranscript('');
                } else {
                    setInterimTranscript(text);
                }
            },
            (error) => {
                console.error("Speech Error:", error);
                setVoiceError(String(error));
                setIsListening(false);
                setInterimTranscript('');
            },
            () => {
                setIsListening(false);
                setInterimTranscript('');
            }
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && !selectedFile) || isLoading) return;

        onSendMessage(input, selectedFile || undefined);
        setInput('');
        clearSelectedFile();
        setVoiceError(null);
        setInterimTranscript('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setVoiceError(null);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="chat-input-panel p-4 glass-panel border-t border-white/10 mt-auto rounded-none md:rounded-b-3xl"
        >
            {selectedFile && (
                <div className="flex items-center gap-2 mb-2 bg-white/10 w-fit px-3 py-1 rounded-full text-xs text-white">
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                    <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="hover:text-red-400"
                    >
                        &times;
                    </button>
                </div>
            )}

            {previewUrl && (
                <div className="mb-2 w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    <img src={previewUrl} alt="Preview foto" className="w-full h-full object-cover" />
                </div>
            )}

            {voiceError && (
                <div className="mb-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {voiceError}
                </div>
            )}

            <div className="relative flex items-center gap-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,image/*"
                    className="hidden"
                />

                <input
                    id="camera-input"
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                />

                <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"
                    title="Ambil Foto"
                >
                    <Camera className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors border border-white/5"
                    title="Tambah File atau Foto"
                >
                    <Paperclip className="w-5 h-5" />
                </button>

                <button
                    type="button"
                    onClick={toggleListening}
                    className={`p-3 rounded-xl transition-colors border border-white/5 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'} ${!isSpeechSupported ? 'opacity-60' : ''}`}
                    title={isSpeechSupported ? "Input Suara" : "Input suara tidak didukung browser ini"}
                >
                    <Mic className="w-5 h-5" />
                </button>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isListening ? (interimTranscript || "Dengarkan suara...") : selectedFile ? "Tanya tentang file/foto ini..." : "Ketik pesan..."}
                    disabled={isLoading}
                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-400 transition-all"
                />

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!isLoading && !input.trim() && !selectedFile}
                    type={isLoading ? 'button' : 'submit'}
                    onClick={isLoading ? onStopResponse : undefined}
                    className={`absolute right-2 p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-colors ${isLoading
                        ? 'bg-red-500 hover:bg-red-600 shadow-red-500/25'
                        : 'bg-gradient-to-r from-primary to-secondary shadow-primary/25'
                        }`}
                    title={isLoading ? 'Stop jawaban' : 'Kirim pesan'}
                >
                    {isLoading ? (
                        <Square className="w-5 h-5 fill-current" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </motion.button>
            </div>
        </form>
    );
};

export default ChatInput;
