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
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-300"
                title="Change Persona"
            >
                <UserCog className="w-5 h-5" />
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:left-auto right-0 top-full mt-2 w-64 bg-dark-lighter border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {personas.map((persona) => (
                        <button
                            key={persona.id}
                            onClick={() => {
                                onPersonaChange(persona.id);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm flex items-start gap-3 hover:bg-white/5 transition-colors ${currentPersona === persona.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                                }`}
                        >
                            <span className="text-xl">{persona.icon}</span>
                            <div>
                                <div className={`font-medium ${currentPersona === persona.id ? 'text-primary' : 'text-gray-200'}`}>
                                    {persona.name}
                                </div>
                                <div className="text-xs text-gray-400">{persona.description}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PersonaSelector;
