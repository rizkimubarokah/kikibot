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
            className="chat-input-panel mt-auto rounded-none border-t border-white/10 p-3 glass-panel md:rounded-b-3xl sm:p-4"
        >
            {selectedFile && (
                <div className="mb-2 flex max-w-full items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white sm:w-fit">
                    <span className="max-w-[260px] truncate sm:max-w-[200px]">{selectedFile.name}</span>
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
                <div className="mb-2 h-20 w-20 overflow-hidden rounded-xl border border-white/10 bg-black/20 sm:h-24 sm:w-24">
                    <img src={previewUrl} alt="Preview foto" className="w-full h-full object-cover" />
                </div>
            )}

            {voiceError && (
                <div className="mb-2 text-xs text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                    {voiceError}
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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

                <div className="flex items-center gap-2 sm:order-none">
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
                        title="Ambil Foto"
                    >
                        <Camera className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/5 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-white sm:h-11 sm:w-11"
                        title="Tambah File atau Foto"
                    >
                        <Paperclip className="h-5 w-5" />
                    </button>

                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/5 transition-colors sm:h-11 sm:w-11 ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'} ${!isSpeechSupported ? 'opacity-60' : ''}`}
                        title={isSpeechSupported ? "Input Suara" : "Input suara tidak didukung browser ini"}
                    >
                        <Mic className="h-5 w-5" />
                    </button>
                </div>

                <div className="relative min-w-0 flex-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? (interimTranscript || "Dengarkan suara...") : selectedFile ? "Tanya tentang file/foto ini..." : "Ketik pesan..."}
                        disabled={isLoading}
                        className="w-full rounded-xl border border-white/10 bg-black/30 py-3 pl-4 pr-12 text-sm text-white placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 sm:text-base"
                    />

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!isLoading && !input.trim() && !selectedFile}
                        type={isLoading ? 'button' : 'submit'}
                        onClick={isLoading ? onStopResponse : undefined}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-white shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isLoading
                            ? 'bg-red-500 shadow-red-500/25 hover:bg-red-600'
                            : 'bg-gradient-to-r from-primary to-secondary shadow-primary/25'
                            }`}
                        title={isLoading ? 'Stop jawaban' : 'Kirim pesan'}
                    >
                        {isLoading ? (
                            <Square className="h-5 w-5 fill-current" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </motion.button>
                </div>
            </div>
        </form>
    );
};

export default ChatInput;
