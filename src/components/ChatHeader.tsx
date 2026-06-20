import React from 'react';
import { Command, Menu, Volume2, VolumeX } from 'lucide-react';
import botAvatar from '../assets/hu-tao-profile.webp';

interface ChatHeaderProps {
    onMenuClick: () => void;
    onCommandClick?: () => void;
    isMuted?: boolean;
    onToggleMute?: () => void;
    controls?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onMenuClick, onCommandClick, isMuted = false, onToggleMute, controls }) => {
    return (
        <div className="glass-panel border-b border-white/10 px-3 py-2.5 sm:p-4 rounded-none md:rounded-t-3xl flex items-center justify-between z-10 relative">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                {onToggleMute && (
                    <button
                        onClick={onToggleMute}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/5 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:h-10 sm:w-10"
                        title={isMuted ? 'Nyalakan suara' : 'Matikan suara'}
                    >
                        {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </button>
                )}
                <div className="relative shrink-0">
                    <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/30 sm:h-10 sm:w-10">
                        <img src={botAvatar} alt="rizki" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-dark rounded-full"></div>
                </div>
                <div className="min-w-0">
                    <h1 className="truncate text-base font-bold tracking-wide text-white sm:text-lg">rizki</h1>
                    <p className="truncate text-[10px] font-medium uppercase tracking-wider text-accent sm:text-xs">Online</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {onCommandClick && (
                    <button
                        onClick={onCommandClick}
                        className="hidden sm:flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                        title="Command palette"
                    >
                        <Command className="w-4 h-4" />
                        Ctrl K
                    </button>
                )}
                {controls && (
                    <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 p-0.5 backdrop-blur-md sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                        {controls}
                    </div>
                )}
                <button
                    onClick={onMenuClick}
                    className="grid h-9 w-9 place-items-center rounded-full text-gray-300 transition-colors hover:bg-white/5 sm:h-10 sm:w-10"
                    title="Buka menu"
                >
                    <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatHeader;
