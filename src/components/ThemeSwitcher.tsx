import React from 'react';
import { Palette } from 'lucide-react';

export type Theme = 'auto' | 'default' | 'yinyang' | 'blackhole' | 'mountain' | 'cyberpunk' | 'pastel' | 'matrix';

interface ThemeSwitcherProps {
    currentTheme: Theme;
    onThemeChange: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onThemeChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const themes: { id: Theme; name: string; color: string }[] = [
        { id: 'auto', name: 'Auto (Live)', color: 'linear-gradient(to right, #60a5fa, #f59e0b)' },
        { id: 'default', name: 'Midnight (Space)', color: '#d946ef' },
        { id: 'yinyang', name: 'Yin Yang (Harmony)', color: '#f3f4f6' },
        { id: 'blackhole', name: 'Black Hole (Void)', color: '#ea580c' },
        { id: 'mountain', name: 'Mountain (Nature)', color: '#10b981' },
        { id: 'cyberpunk', name: 'Cyberpunk', color: '#facc15' },
        { id: 'pastel', name: 'Pastel', color: '#f9a8d4' },
        { id: 'matrix', name: 'Matrix', color: '#22c55e' },
    ];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-300"
                title="Change Theme"
            >
                <Palette className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-dark-lighter border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => {
                                onThemeChange(theme.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-white/5 transition-colors ${currentTheme === theme.id ? 'text-primary font-medium' : 'text-gray-300'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: theme.color }}
                            />
                            {theme.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
