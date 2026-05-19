import React from 'react';
import { Menu, Volume2, VolumeX } from 'lucide-react';
import botAvatar from '../assets/avatar.png';

interface ChatHeaderProps {
    onMenuClick: () => void;
    isMuted?: boolean;
    onToggleMute?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onMenuClick, isMuted = false, onToggleMute }) => {
    return (
        <div className="glass-panel border-b border-white/10 p-4 rounded-none md:rounded-t-3xl flex items-center justify-between z-10 relative">
            <div className="flex items-center gap-3">
                {onToggleMute && (
                    <button
                        onClick={onToggleMute}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                )}
                <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30 overflow-hidden">
                        <img src={botAvatar} alt="rizki" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-dark rounded-full"></div>
                </div>
                <div>
                    <h1 className="font-bold text-lg text-white tracking-wide">rizki</h1>
                    <p className="text-xs text-accent uppercase tracking-wider font-medium">Online</p>
                </div>
            </div>

            <button
                onClick={onMenuClick}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-300"
            >
                <Menu className="w-6 h-6" />
            </button>
        </div>
    );
};

export default ChatHeader;
