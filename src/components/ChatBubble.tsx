import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Message } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import botAvatar from '../assets/avatar.png';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodePreview from './CodePreview';
import MusicCard from './MusicCard';
import MediaCard from './MediaCard';
import MedicalFactCard from './MedicalFactCard';
import WeatherCard from './WeatherCard';
import { getSeason } from '../utils/timeCycle';

const SeasonalDecoration: React.FC = () => {
    const season = getSeason();

    // Seasonal Icons/Characters
    const decorations = {
        winter: '⛄', // Olaf!
        spring: '🌸',
        summer: '☀️',
        autumn: '🍂'
    };

    return (
        <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 -right-2 text-xl filter drop-shadow-md cursor-pointer hover:scale-125 transition-transform"
            title={`It's ${season}!`}
        >
            {decorations[season]}
        </motion.div>
    );
};

interface ChatBubbleProps {
    message: Message;
    stopAnimationToken?: number;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, stopAnimationToken = 0 }) => {
    const isBot = message.sender === 'bot';
    const [imageStatus, setImageStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);

    // Typewriter Effect Logic
    const [displayedText, setDisplayedText] = useState(() => {
        // If it's a bot message and very recent (< 2s ago), start empty to animate
        // Otherwise (history or old), show full text immediately
        if (isBot && Date.now() - message.timestamp < 2000) {
            return '';
        }
        return message.text;
    });

    useEffect(() => {
        if (!isBot) return;
        if (stopAnimationToken > 0) {
            setDisplayedText(message.text);
            return;
        }

        // If text is already full, do nothing
        if (displayedText === message.text) return;

        // If message is old, just set full text (safety)
        if (Date.now() - message.timestamp > 5000) {
            setDisplayedText(message.text);
            return;
        }

        let currentIndex = 0;
        const speed = 15; // ms per char

        const intervalId = setInterval(() => {
            if (currentIndex < message.text.length) {
                setDisplayedText(prev => message.text.slice(0, prev.length + 1));
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, speed);

        return () => clearInterval(intervalId);
    }, [message.text, isBot, stopAnimationToken]); // Depend on message.text to restart if it changes (unlikely for now)


    // Image Loading Logic
    useEffect(() => {
        if (message.imageUrl) {
            loadImage(message.imageUrl);
        }
        return () => {
            if (imageBlobUrl) URL.revokeObjectURL(imageBlobUrl);
        };
    }, [message.imageUrl]);

    const loadImage = async (url: string) => {
        setImageStatus('loading');
        setIsRetrying(true);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImageBlobUrl(objectUrl);
            setImageStatus('success');
        } catch (error) {
            console.error('Failed to load image:', error);
            setImageStatus('error');
        } finally {
            setIsRetrying(false);
        }
    };

    const handleDownloadImage = async (url: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `generated-image-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={clsx(
                "flex w-full mb-4",
                isBot ? "justify-start" : "justify-end"
            )}
        >
            <div className={clsx(
                "flex max-w-[80%] md:max-w-[70%]",
                isBot ? "flex-row" : "flex-row-reverse"
            )}>
                {/* Avatar */}
                <div className={clsx(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-lg",
                    isBot ? "mr-3 border-primary/50 shadow-primary/20 bg-dark-lighter" : "ml-3 border-secondary/50 shadow-secondary/20 bg-dark-lighter"
                )}>
                    {isBot ? (
                        <img src={botAvatar} alt="rizki" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-6 h-6 text-secondary" />
                    )}
                </div>

                {/* Bubble */}
                <div className={twMerge(
                    "relative px-5 py-3 rounded-2xl text-sm md:text-base shadow-md backdrop-blur-sm overflow-hidden",
                    isBot
                        ? "rounded-tl-none bg-dark-lighter/80 border border-white/5 text-gray-100"
                        : "rounded-tr-none bg-gradient-to-br from-primary to-secondary text-white border border-white/10"
                )}>
                    {isBot ? (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                strong: ({ node, ...props }) => <span className="font-bold text-primary" {...props} />,
                                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-primary mb-2" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-base font-bold text-primary mb-2" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-base font-semibold text-secondary mb-1" {...props} />,
                                code: ({ node, className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const isInline = !match;

                                    if (isInline) {
                                        return (
                                            <code className="bg-white/10 px-1 py-0.5 rounded text-primary font-mono text-sm" {...props}>
                                                {children}
                                            </code>
                                        );
                                    }

                                    return (
                                        <CodePreview
                                            code={String(children).replace(/\n$/, '')}
                                            language={match ? match[1] : ''}
                                        />
                                    );
                                },
                            }}
                        >
                            {displayedText}
                        </ReactMarkdown>
                    ) : (
                        message.text
                    )}

                    {/* Glow effect for bot */}
                    {isBot && (
                        <div className="absolute inset-0 rounded-2xl rounded-tl-none ring-1 ring-inset ring-white/10 pointer-events-none" />
                    )}

                    {/* Seasonal Decoration (Olaf & Friends) */}
                    {isBot && (
                        <SeasonalDecoration />
                    )}
                </div>

                {/* Music Card (Legacy) */}
                {message.musicData && (
                    <div className="mt-2 w-full max-w-sm">
                        <MusicCard data={message.musicData} />
                    </div>
                )}

                {/* Enhanced Media Card */}
                {message.mediaData && (
                    <div className="mt-2 w-full">
                        <MediaCard data={message.mediaData} />
                    </div>
                )}

                {/* Medical Fact Card */}
                {message.medicalData && (
                    <div className="mt-2 w-full">
                        <MedicalFactCard data={message.medicalData} />
                    </div>
                )}

                {/* Weather Card */}
                {message.weatherData && (
                    <div className="mt-2 w-full">
                        <WeatherCard data={message.weatherData} />
                    </div>
                )}

                {/* Generated Image */}
                {message.imageUrl && (
                    <div className="mt-2 w-full max-w-sm space-y-2">
                        <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/20 min-h-[200px] flex items-center justify-center relative group">
                            {imageStatus === 'loading' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-primary/70 bg-black/10 backdrop-blur-sm z-20">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                    <span className="text-xs font-medium">Generating visual...</span>
                                </div>
                            )}

                            {imageStatus === 'error' && (
                                <div className="flex flex-col items-center justify-center p-6 text-center text-red-400 gap-2">
                                    <AlertCircle className="w-8 h-8 opacity-80" />
                                    <p className="text-sm font-medium">Failed to load image</p>
                                    <button
                                        onClick={() => loadImage(message.imageUrl!)}
                                        disabled={isRetrying}
                                        className="mt-2 text-xs px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-full transition-colors flex items-center gap-1.5"
                                    >
                                        <RefreshCw className={clsx("w-3 h-3", isRetrying && "animate-spin")} />
                                        Retry
                                    </button>
                                </div>
                            )}

                            {imageStatus === 'success' && imageBlobUrl && (
                                <img
                                    src={imageBlobUrl}
                                    alt="Generated"
                                    className="w-full h-auto object-cover transition-opacity duration-500"
                                />
                            )}
                        </div>

                        {imageStatus === 'success' && (
                            <button
                                onClick={() => handleDownloadImage(message.imageUrl!)}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-lg transition-all text-xs font-medium"
                            >
                                <Download className="w-4 h-4" /> Download Image
                            </button>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChatBubble;
