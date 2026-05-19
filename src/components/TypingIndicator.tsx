import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator: React.FC = () => {
    return (
        <div className="flex items-center space-x-3 p-3 bg-dark-lighter/80 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-none w-fit shadow-lg">
            {/* Dots */}
            <div className="flex space-x-1">
                {[0, 1, 2].map((dot) => (
                    <motion.div
                        key={dot}
                        className="w-2 h-2 bg-primary rounded-full"
                        animate={{
                            y: [0, -4, 0],
                            opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: dot * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Text */}
            <span className="text-xs font-medium text-gray-400 italic">
                rizki sedang mengetik...
            </span>
        </div>
    );
};

export default TypingIndicator;
