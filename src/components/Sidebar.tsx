import React, { useEffect, useMemo, useState } from 'react';
import {
    X,
    Brain,
    Download,
    Gamepad2,
    Info,
    Search,
    Settings,
    LayoutGrid,
    Plus,
    MessageSquare,
    Pin,
    Trash2,
    PinOff,
    FileText,
    Wrench,
    Rows3,
    Rows4
} from 'lucide-react';
import type { ChatSession, Message } from '../types';
import ContextSuggestions from './ContextSuggestions';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenGame: (gameId: string) => void;
    sessions: ChatSession[];
    currentSessionId: string;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onPinSession: (id: string, e: React.MouseEvent) => void;
    onDeleteSession: (id: string, e: React.MouseEvent) => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    onOpenMemory: () => void;
    onExportChat: () => void;
    onOpenAbout: () => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    displayMode: DisplayMode;
    onDisplayModeChange: (mode: DisplayMode) => void;
}

type SearchHit = {
    session: ChatSession;
    snippet: string;
    score: number;
};

type SidebarTab = 'chat' | 'tools' | 'games' | 'settings';
type DisplayMode = 'compact' | 'comfortable';

const normalize = (value: string) => value.trim().toLowerCase();

const getMessageSnippet = (text: string, query: string) => {
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const normalizedQuery = normalize(query);

    if (!normalizedQuery) {
        return normalizedText.slice(0, 110);
    }

    const matchIndex = normalizedText.toLowerCase().indexOf(normalizedQuery);
    if (matchIndex === -1) {
        return normalizedText.slice(0, 110);
    }

    const start = Math.max(0, matchIndex - 32);
    const end = Math.min(normalizedText.length, matchIndex + normalizedQuery.length + 48);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < normalizedText.length ? '...' : '';

    return `${prefix}${normalizedText.slice(start, end)}${suffix}`;
};

const highlightText = (text: string, query: string) => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return text;

    const lowerText = text.toLowerCase();
    const matchIndex = lowerText.indexOf(normalizedQuery);
    if (matchIndex === -1) return text;

    const before = text.slice(0, matchIndex);
    const match = text.slice(matchIndex, matchIndex + normalizedQuery.length);
    const after = text.slice(matchIndex + normalizedQuery.length);

    return (
        <>
            {before}
            <span className="rounded bg-primary/20 px-1 text-white">{match}</span>
            {after}
        </>
    );
};

const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onClose,
    onOpenGame,
    sessions,
    currentSessionId,
    onNewChat,
    onSelectSession,
    onPinSession,
    onDeleteSession,
    messages,
    onSendMessage,
    onOpenMemory,
    onExportChat,
    onOpenAbout,
    searchQuery,
    onSearchQueryChange,
    displayMode,
    onDisplayModeChange
}) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);
    const [activeTab, setActiveTab] = useState<SidebarTab>('chat');

    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const searchResults = useMemo(() => {
        const normalized = normalize(localQuery);
        if (!normalized) return [];

        const scored = sessions
            .map((session) => {
                const titleMatch = session.title.toLowerCase().includes(normalized);
                const messageMatches = session.messages.filter((message) => message.text.toLowerCase().includes(normalized));
                const latestMatch = messageMatches.at(-1);

                if (!titleMatch && messageMatches.length === 0) {
                    return null;
                }

                return {
                    session,
                    snippet: latestMatch
                        ? getMessageSnippet(latestMatch.text, localQuery)
                        : getMessageSnippet(session.messages.at(-1)?.text || '', localQuery),
                    score: (titleMatch ? 2 : 0) + messageMatches.length + (session.isPinned ? 1 : 0)
                } satisfies SearchHit;
            })
            .filter(Boolean) as SearchHit[];

        return scored
            .sort((a, b) => {
                if (a.score !== b.score) return b.score - a.score;
                return b.session.timestamp - a.session.timestamp;
            });
    }, [localQuery, sessions]);

    useEffect(() => {
        if (window.location.pathname === '/games') {
            setActiveTab('games');
            onOpenGame('novel_horror');
        }
    }, [onOpenGame]);

    const normalizedQuery = normalize(localQuery);
    const hasQuery = normalizedQuery.length > 0;
    const sessionCount = sessions.length;
    const visibleSessions = hasQuery ? searchResults.map((item) => item.session) : sessions;

    const tabs = [
        { id: 'chat' as const, label: 'Chat', icon: MessageSquare },
        { id: 'tools' as const, label: 'Tools', icon: Wrench },
        { id: 'games' as const, label: 'Games', icon: Gamepad2 },
        { id: 'settings' as const, label: 'Settings', icon: Settings }
    ];

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed right-0 top-0 z-50 flex h-full w-80 transform flex-col border-l border-white/10 bg-dark-lighter shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-shrink-0 p-6 pb-3">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                                <LayoutGrid className="h-6 w-6 text-primary" />
                                Menu
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="grid grid-cols-4 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium transition-all ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                            : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
                                            }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                        {activeTab === 'chat' && (
                            <div className="space-y-6">
                                <button
                                    onClick={() => {
                                        onNewChat();
                                        onClose();
                                    }}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-dark"
                                >
                                    <Plus className="h-5 w-5" />
                                    New Chat
                                </button>

                                <div className="pt-2">
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <MessageSquare className="h-4 w-4" />
                                        History
                                    </h3>
                                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                        <Search className="h-4 w-4 text-gray-500" />
                                        <input
                                            value={localQuery}
                                            onChange={(event) => {
                                                setLocalQuery(event.target.value);
                                                onSearchQueryChange(event.target.value);
                                            }}
                                            className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                            placeholder="Cari isi chat..."
                                        />
                                    </div>

                                    <div className="mb-3 flex items-center justify-between text-[11px] text-gray-500">
                                        <span>{sessionCount} sesi</span>
                                        <span>{hasQuery ? `${searchResults.length} hasil` : 'Semua sesi'}</span>
                                    </div>

                                    <div className="space-y-2">
                                        {hasQuery && searchResults.length === 0 ? (
                                            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-gray-500">
                                                Tidak ada hasil untuk <span className="text-white">"{localQuery}"</span>.
                                            </div>
                                        ) : (
                                            visibleSessions.map((session) => {
                                                const firstMatch = session.messages.find((message) =>
                                                    normalize(message.text).includes(normalizedQuery)
                                                );
                                                const preview = hasQuery
                                                    ? getMessageSnippet(firstMatch?.text || session.messages.at(-1)?.text || '', localQuery)
                                                    : session.messages.at(-1)?.text?.slice(0, 110) || 'New Chat';

                                                return (
                                                    <div
                                                        key={session.id}
                                                        className={`group relative w-full rounded-xl border transition-all ${currentSessionId === session.id
                                                            ? 'border-primary/50 bg-primary/10 text-white'
                                                            : 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                                            }`}
                                                    >
                                                        <button
                                                            onClick={() => {
                                                                onSelectSession(session.id);
                                                                onClose();
                                                            }}
                                                            className="w-full px-4 py-3 pr-16 text-left"
                                                        >
                                                            <div className="truncate text-sm font-medium">
                                                                {hasQuery ? highlightText(session.title || 'New Chat', localQuery) : (session.title || 'New Chat')}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500">
                                                                <FileText className="h-3.5 w-3.5" />
                                                                <span className="line-clamp-2 text-left">{hasQuery ? highlightText(preview, localQuery) : preview}</span>
                                                            </div>
                                                        </button>

                                                        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                            <button
                                                                onClick={(e) => onPinSession(session.id, e)}
                                                                className={`rounded-lg p-1.5 transition-colors ${session.isPinned
                                                                    ? 'bg-primary/20 text-primary hover:bg-primary/30'
                                                                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                                title={session.isPinned ? 'Unpin' : 'Pin'}
                                                            >
                                                                {session.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => onDeleteSession(session.id, e)}
                                                                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>

                                                        {session.isPinned && (
                                                            <div className="absolute left-1 top-1/2 -ml-2 -translate-y-1/2">
                                                                <div className="h-8 w-1 rounded-full bg-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'tools' && (
                            <div className="space-y-6">
                                <ContextSuggestions
                                    messages={messages}
                                    onSelectSuggestion={(text) => {
                                        onSendMessage(text);
                                        onClose();
                                    }}
                                />

                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <Wrench className="h-4 w-4" />
                                        Tools
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={onOpenMemory}
                                            className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/10"
                                        >
                                            <Brain className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="text-sm font-medium text-white">Memori</div>
                                                <div className="text-xs text-gray-500">Preferensi jawaban</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={onExportChat}
                                            className="flex min-h-24 flex-col items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-colors hover:border-secondary/50 hover:bg-secondary/10"
                                        >
                                            <Download className="h-5 w-5 text-secondary" />
                                            <div>
                                                <div className="text-sm font-medium text-white">Export</div>
                                                <div className="text-xs text-gray-500">Simpan chat</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <MessageSquare className="h-4 w-4" />
                                        Aksi Cepat
                                    </h3>
                                    <div className="space-y-2">
                                        {[
                                            'Buatkan brief harian yang ringkas.',
                                            'Cek cuaca Jakarta hari ini.',
                                            'Bantu rangkum file yang aku upload.',
                                            'Buatkan ide gambar AI yang cinematic.'
                                        ].map((text) => (
                                            <button
                                                key={text}
                                                onClick={() => {
                                                    onSendMessage(text);
                                                    onClose();
                                                }}
                                                className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left text-sm text-gray-300 transition-colors hover:border-accent/50 hover:bg-white/10 hover:text-white"
                                            >
                                                {text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'games' && (
                            <div>
                                <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <Gamepad2 className="h-4 w-4" />
                                    Mini Games
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => onOpenGame('tictactoe')}
                                        className="group w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-white/10"
                                    >
                                        <div className="font-medium text-gray-200 group-hover:text-primary">Tic-Tac-Toe</div>
                                        <div className="text-xs text-gray-500">Classic X vs O strategy</div>
                                    </button>

                                    <button
                                        onClick={() => onOpenGame('rps')}
                                        className="group w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-secondary/50 hover:bg-white/10"
                                    >
                                        <div className="font-medium text-gray-200 group-hover:text-secondary">Rock Paper Scissors</div>
                                        <div className="text-xs text-gray-500">Test your luck against rizki</div>
                                    </button>

                                    <button
                                        onClick={() => onOpenGame('minibattles')}
                                        className="group w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-accent/50 hover:bg-white/10"
                                    >
                                        <div className="font-medium text-gray-200 group-hover:text-accent">12 MiniBattles</div>
                                        <div className="text-xs text-gray-500">Crazy multiplayer fun!</div>
                                    </button>

                                    <button
                                        onClick={() => onOpenGame('novel_horror')}
                                        className="group w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-red-500/50 hover:bg-white/10"
                                    >
                                        <div className="font-medium text-gray-200 group-hover:text-red-500">The Basement</div>
                                        <div className="text-xs text-gray-500">Interactive Horror Novel</div>
                                    </button>

                                    <button
                                        onClick={() => onOpenGame('insomnia')}
                                        className="group w-full rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-left transition-all hover:border-red-600/50 hover:bg-white/10"
                                    >
                                        <div className="font-medium text-gray-200 group-hover:text-red-600">Insomnia</div>
                                        <div className="text-xs text-gray-500">Don't Blink. Survival Horror.</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <Rows4 className="h-4 w-4" />
                                        Tampilan
                                    </h3>
                                    <div className="rounded-2xl border border-white/10 bg-black/20 p-1">
                                        <div className="grid grid-cols-2 gap-1">
                                            {[
                                                {
                                                    id: 'compact' as const,
                                                    label: 'Compact',
                                                    description: 'Lebih padat',
                                                    icon: Rows3
                                                },
                                                {
                                                    id: 'comfortable' as const,
                                                    label: 'Comfort',
                                                    description: 'Lebih lega',
                                                    icon: Rows4
                                                }
                                            ].map((mode) => {
                                                const Icon = mode.icon;
                                                const isActive = displayMode === mode.id;

                                                return (
                                                    <button
                                                        key={mode.id}
                                                        onClick={() => onDisplayModeChange(mode.id)}
                                                        className={`rounded-xl px-3 py-3 text-left transition-all ${isActive
                                                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                            }`}
                                                    >
                                                        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                                                            <Icon className="h-4 w-4" />
                                                            {mode.label}
                                                        </div>
                                                        <div className={`text-xs ${isActive ? 'text-white/75' : 'text-gray-500'}`}>
                                                            {mode.description}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <Settings className="h-4 w-4" />
                                        System
                                    </h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={onOpenAbout}
                                            className="flex w-full items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                                        >
                                            <Info className="h-4 w-4" />
                                            About rizki
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
