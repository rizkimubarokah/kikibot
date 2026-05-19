import React from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChatContainerProps {
    children: ReactNode;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full md:max-w-2xl h-[100dvh] md:h-[800px] flex flex-col relative glass-panel rounded-none md:rounded-3xl shadow-2xl overflow-hidden md:mx-4"
        >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-60 h-60 bg-primary/20 rounded-full blur-[80px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 bg-secondary/20 rounded-full blur-[80px] animate-pulse-slow"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full w-full">
                {children}
            </div>
        </motion.div>
    );
};

export default ChatContainer;
