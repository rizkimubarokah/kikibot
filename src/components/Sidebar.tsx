import React, { useEffect, useMemo, useState } from 'react';
import { X, Brain, Download, Gamepad2, Info, Search, Settings, LayoutGrid, Plus, MessageSquare, Pin, Trash2, PinOff } from 'lucide-react';
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
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
}

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
    searchQuery,
    onSearchQueryChange
}) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    useEffect(() => {
        setLocalQuery(searchQuery);
    }, [searchQuery]);

    const filteredSessions = useMemo(() => {
        const normalized = localQuery.trim().toLowerCase();
        if (!normalized) return sessions;

        return sessions.filter((session) =>
            session.title.toLowerCase().includes(normalized)
            || session.messages.some((message) => message.text.toLowerCase().includes(normalized))
        );
    }, [localQuery, sessions]);

    // Auto-open horror game if URL is /games
    useEffect(() => {
        if (window.location.pathname === '/games') {
            onOpenGame('novel_horror');
        }
    }, [onOpenGame]);

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-dark-lighter border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">
                    <div className="p-6 pb-2 flex-shrink-0">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutGrid className="w-6 h-6 text-primary" />
                                Menu
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        {/* New Chat Button */}
                        <button
                            onClick={() => {
                                onNewChat();
                                onClose();
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl transition-all shadow-lg shadow-primary/20 font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            New Chat
                        </button>
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={onOpenMemory}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:border-primary/50 hover:text-white transition-colors"
                            >
                                <Brain className="w-4 h-4" />
                                Memori
                            </button>
                            <button
                                onClick={onExportChat}
                                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300 hover:border-secondary/50 hover:text-white transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Main Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6 space-y-6">
                        {/* Context Suggestions */}
                        <ContextSuggestions
                            messages={messages}
                            onSelectSuggestion={(text) => {
                                onSendMessage(text);
                                onClose();
                            }}
                        />

                        {/* Divider */}
                        <div className="border-t border-white/5"></div>

                        {/* History Section */}
                        <div className="pt-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2 sticky top-0 bg-dark-lighter py-1 z-10">
                                <MessageSquare className="w-4 h-4" />
                                History
                            </h3>
                            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                                <Search className="w-4 h-4 text-gray-500" />
                                <input
                                    value={localQuery}
                                    onChange={(event) => {
                                        setLocalQuery(event.target.value);
                                        onSearchQueryChange(event.target.value);
                                    }}
                                    className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                                    placeholder="Cari chat..."
                                />
                            </div>
                            <div className="space-y-2">
                                {filteredSessions.length === 0 ? (
                                    <p className="text-xs text-gray-600 italic px-2">No history yet</p>
                                ) : (
                                    filteredSessions.map(session => (
                                        <div
                                            key={session.id}
                                            className={`group relative w-full rounded-xl border transition-all ${currentSessionId === session.id
                                                ? 'bg-primary/10 border-primary/50 text-white'
                                                : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
                                                }`}
                                        >
                                            <button
                                                onClick={() => {
                                                    onSelectSession(session.id);
                                                    onClose();
                                                }}
                                                className="w-full text-left px-4 py-3 text-sm truncate pr-16"
                                            >
                                                {session.title || 'New Chat'}
                                            </button>

                                            {/* Actions */}
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => onPinSession(session.id, e)}
                                                    className={`p-1.5 rounded-lg transition-colors ${session.isPinned
                                                        ? 'text-primary bg-primary/20 hover:bg-primary/30'
                                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                        }`}
                                                    title={session.isPinned ? "Unpin" : "Pin"}
                                                >
                                                    {session.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                                                </button>
                                                <button
                                                    onClick={(e) => onDeleteSession(session.id, e)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            {/* Pinned Indicator */}
                                            {session.isPinned && (
                                                <div className="absolute left-1 top-1/2 -translate-y-1/2 -ml-2">
                                                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-white/5"></div>

                        {/* Mini Games Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Gamepad2 className="w-4 h-4" />
                                Mini Games
                            </h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => onOpenGame('tictactoe')}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 transition-all group"
                                >
                                    <div className="font-medium text-gray-200 group-hover:text-primary">Tic-Tac-Toe</div>
                                    <div className="text-xs text-gray-500">Classic X vs O strategy</div>
                                </button>

                                <button
                                    onClick={() => onOpenGame('rps')}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-secondary/50 transition-all group"
                                >
                                    <div className="font-medium text-gray-200 group-hover:text-secondary">Rock Paper Scissors</div>
                                    <div className="text-xs text-gray-500">Test your luck against rizki</div>
                                </button>

                                <button
                                    onClick={() => onOpenGame('minibattles')}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-accent/50 transition-all group"
                                >
                                    <div className="font-medium text-gray-200 group-hover:text-accent">12 MiniBattles</div>
                                    <div className="text-xs text-gray-500">Crazy multiplayer fun!</div>
                                </button>

                                <button
                                    onClick={() => onOpenGame('novel_horror')}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/50 transition-all group"
                                >
                                    <div className="font-medium text-gray-200 group-hover:text-red-500">The Basement</div>
                                    <div className="text-xs text-gray-500">Interactive Horror Novel</div>
                                </button>

                                <button
                                    onClick={() => onOpenGame('insomnia')}
                                    className="w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/50 transition-all group"
                                >
                                    <div className="font-medium text-gray-200 group-hover:text-red-600">Insomnia</div>
                                    <div className="text-xs text-gray-500">Don't Blink. Survival Horror.</div>
                                </button>
                            </div>
                        </div>

                        {/* System Section */}
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                System
                            </h3>
                            <div className="space-y-1">
                                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                    <Info className="w-4 h-4" />
                                    About rizki
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
