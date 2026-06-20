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
                className="grid h-9 w-9 place-items-center rounded-full text-gray-300 transition-colors hover:bg-white/5 sm:h-10 sm:w-10"
                title="Change Theme"
            >
                <Palette className="h-5 w-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 max-h-[70dvh] w-[min(15rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-white/10 bg-dark-lighter shadow-xl animate-in fade-in slide-in-from-top-2 sm:w-40">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            onClick={() => {
                                onThemeChange(theme.id);
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${currentTheme === theme.id ? 'font-medium text-primary' : 'text-gray-300'
                                }`}
                        >
                            <div
                                className="h-3 w-3 shrink-0 rounded-full"
                                style={{ backgroundColor: theme.color }}
                            />
                            <span className="truncate">{theme.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
