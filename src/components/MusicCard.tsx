import React from 'react';
import { Download, Music } from 'lucide-react';

interface MusicCardProps {
    data: {
        title: string;
        author: string;
        thumbnail: string;
        url: string;
    };
}

const MusicCard: React.FC<MusicCardProps> = ({ data }) => {
    return (
        <div className="w-full max-w-sm mt-2 rounded-xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-xl transition-all hover:border-indigo-500/50">
            {/* Thumbnail Header */}
            <div className="relative aspect-video group">
                <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                    <div className="w-full">
                        <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                            <Music className="w-3 h-3" /> Music Result
                        </div>
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
                            {data.title}
                        </h3>
                        <p className="text-gray-300 text-sm">{data.author}</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-4 space-y-4">
                {/* Audio Player */}
                <audio
                    controls
                    src={data.url}
                    className="w-full h-8 accent-indigo-500 rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                />

                {/* Actions */}
                <div className="flex gap-2">
                    <a
                        href={data.url}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors text-sm shadow-lg shadow-indigo-900/20"
                    >
                        <Download className="w-4 h-4" /> Download MP3
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MusicCard;
