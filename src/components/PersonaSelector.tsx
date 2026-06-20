import React from 'react';
import { UserCog } from 'lucide-react';

export type Persona = 'default' | 'coding_expert' | 'teacher' | 'best_friend';

interface PersonaSelectorProps {
    currentPersona: Persona;
    onPersonaChange: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ currentPersona, onPersonaChange }) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const personas: { id: Persona; name: string; description: string; icon: string }[] = [
        { id: 'default', name: 'rizki', description: 'Balanced and helpful', icon: '🤖' },
        { id: 'coding_expert', name: 'rizki', description: 'Concise, code-focused, technical', icon: '👨‍💻' },
        { id: 'teacher', name: 'rizki', description: 'Patient, explanatory, educational', icon: '🧑‍🏫' },
        { id: 'best_friend', name: 'rizki', description: 'Casual, slang, fun, lots of emojis', icon: '👯' },
    ];

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="grid h-8 w-8 place-items-center rounded-xl text-gray-300 transition-colors hover:bg-white/10 sm:h-10 sm:w-10 sm:rounded-full"
                title="Change Persona"
            >
                <UserCog className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 max-h-[70dvh] w-[min(18rem,calc(100vw-1.5rem))] overflow-y-auto rounded-xl border border-white/10 bg-dark-lighter shadow-xl animate-in fade-in slide-in-from-top-2 sm:w-64">
                    {personas.map((persona) => (
                        <button
                            key={persona.id}
                            onClick={() => {
                                onPersonaChange(persona.id);
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-white/5 ${currentPersona === persona.id ? 'border-l-2 border-primary bg-primary/10' : ''
                                }`}
                        >
                            <span className="text-xl leading-none">{persona.icon}</span>
                            <div className="min-w-0">
                                <div className={`font-medium ${currentPersona === persona.id ? 'text-primary' : 'text-gray-200'}`}>
                                    {persona.name}
                                </div>
                                <div className="line-clamp-2 text-xs text-gray-400">{persona.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PersonaSelector;
