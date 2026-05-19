import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

type Player = 'X' | 'O' | null;

const TicTacToe: React.FC = () => {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);
    const [winner, setWinner] = useState<Player | 'Draw' | null>(null);

    const checkWinner = (squares: Player[]) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return squares.includes(null) ? null : 'Draw';
    };

    useEffect(() => {
        if (!isXNext && !winner) {
            // rizki Move (Simple Random/Block logic could go here, sticking to random for now)
            const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
            if (emptyIndices.length > 0) {
                const timer = setTimeout(() => {
                    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                    const newBoard = [...board];
                    newBoard[randomIndex] = 'O';
                    setBoard(newBoard);
                    setIsXNext(true);
                    setWinner(checkWinner(newBoard));
                }, 500);
                return () => clearTimeout(timer);
            }
        }
    }, [isXNext, winner, board]);

    const handleClick = (index: number) => {
        if (board[index] || winner || !isXNext) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXNext(false);
        setWinner(checkWinner(newBoard));
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="grid grid-cols-3 gap-3">
                {board.map((cell, index) => (
                    <button
                        key={index}
                        onClick={() => handleClick(index)}
                        disabled={!!cell || !!winner || !isXNext}
                        className={`w-20 h-20 rounded-xl text-4xl font-bold flex items-center justify-center transition-all ${cell === 'X' ? 'bg-primary/20 text-primary border-2 border-primary' :
                            cell === 'O' ? 'bg-secondary/20 text-secondary border-2 border-secondary' :
                                'bg-white/5 hover:bg-white/10 border border-white/10'
                            }`}
                    >
                        {cell}
                    </button>
                ))}
            </div>

            {winner && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                    <div className="text-xl font-bold text-white mb-2">
                        {winner === 'Draw' ? "It's a Draw! 🤝" : `${winner === 'X' ? 'You Won! 🎉' : 'rizki Won! 🤖'}`}
                    </div>
                    <button
                        onClick={resetGame}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors mx-auto"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Play Again
                    </button>
                </div>
            )}

            {!winner && (
                <div className="text-sm text-gray-400">
                    {isXNext ? "Your Turn (X)" : "rizki thinking... (O)"}
                </div>
            )}
        </div>
    );
};

export default TicTacToe;
