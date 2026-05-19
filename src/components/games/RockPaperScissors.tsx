import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

type Choice = 'rock' | 'paper' | 'scissors';

const choices: { id: Choice; icon: string; beats: Choice }[] = [
    { id: 'rock', icon: '✊', beats: 'scissors' },
    { id: 'paper', icon: '✋', beats: 'rock' },
    { id: 'scissors', icon: '✌️', beats: 'paper' },
];

const RockPaperScissors: React.FC = () => {
    const [userChoice, setUserChoice] = useState<Choice | null>(null);
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
    const [result, setResult] = useState<string | null>(null);
    const [streak, setStreak] = useState(0);

    const playGame = (choice: Choice) => {
        setUserChoice(choice);

        // Random rizki choice
        const randomChoice = choices[Math.floor(Math.random() * choices.length)];
        setComputerChoice(randomChoice.id);

        if (choice === randomChoice.id) {
            setResult('Draw! 🤝');
        } else if (choices.find(c => c.id === choice)?.beats === randomChoice.id) {
            setResult('You Win! 🎉');
            setStreak(s => s + 1);
        } else {
            setResult('You Lose! 🤖');
            setStreak(0);
        }
    };

    const reset = () => {
        setUserChoice(null);
        setComputerChoice(null);
        setResult(null);
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <div className="text-center">
                <div className="text-sm text-gray-400 mb-1">Win Streak</div>
                <div className="text-2xl font-bold text-primary">{streak}🔥</div>
            </div>

            {!userChoice ? (
                <div className="grid grid-cols-3 gap-4">
                    {choices.map((choice) => (
                        <button
                            key={choice.id}
                            onClick={() => playGame(choice.id)}
                            className="w-20 h-20 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-4xl transition-transform hover:scale-110 active:scale-95"
                        >
                            {choice.icon}
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-300">
                    <div className="flex items-center gap-8">
                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-2">You</div>
                            <div className="w-24 h-24 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-5xl">
                                {choices.find(c => c.id === userChoice)?.icon}
                            </div>
                        </div>

                        <div className="text-2xl font-bold text-gray-300">VS</div>

                        <div className="text-center">
                            <div className="text-xs text-gray-500 mb-2">rizki</div>
                            <div className="w-24 h-24 rounded-2xl bg-secondary/20 border-2 border-secondary flex items-center justify-center text-5xl">
                                {choices.find(c => c.id === computerChoice)?.icon}
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-white mb-4">{result}</div>
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RockPaperScissors;
