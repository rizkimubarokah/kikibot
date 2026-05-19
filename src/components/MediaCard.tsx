import React from 'react';
import { Download, Music, Video, Play, Instagram, Youtube } from 'lucide-react';
import type { MediaData } from '../services/mediaDownloader';

interface MediaCardProps {
    data: MediaData;
}

const PlatformBadge: React.FC<{ platform: string }> = ({ platform }) => {
    const badges = {
        youtube: { icon: Youtube, color: 'bg-red-600', label: 'YouTube' },
        spotify: { icon: Music, color: 'bg-green-600', label: 'Spotify' },
        instagram: { icon: Instagram, color: 'bg-pink-600', label: 'Instagram' },
        tiktok: { icon: Video, color: 'bg-black', label: 'TikTok' }
    };

    const badge = badges[platform as keyof typeof badges] || { icon: Music, color: 'bg-gray-600', label: platform };
    const Icon = badge.icon;

    return (
        <div className={`flex items-center gap-1.5 ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg`}>
            <Icon className="w-3 h-3" />
            {badge.label}
        </div>
    );
};

const MediaCard: React.FC<MediaCardProps> = ({ data }) => {
    const [downloadingUrl, setDownloadingUrl] = React.useState<string | null>(null);

    const formatNumber = (num: number) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDownload = async (e: React.MouseEvent, url: string, filename: string) => {
        e.preventDefault();
        if (downloadingUrl) return;

        try {
            setDownloadingUrl(url);

            // Try fetch method first to force download
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed, falling back to new tab:', error);
            // Fallback: Open in new tab
            window.open(url, '_blank');
        } finally {
            setDownloadingUrl(null);
        }
    };

    return (
        <div className="w-full max-w-md mt-2 rounded-xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-xl transition-all hover:border-primary/50">
            {/* Thumbnail Header */}
            <div className="relative aspect-video group">
                <img
                    src={data.thumbnail}
                    alt={data.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext fill="%23cbd5e1" font-family="system-ui" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Thumbnail%3C/text%3E%3C/svg%3E';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent flex items-end p-4">
                    <div className="w-full space-y-2">
                        <PlatformBadge platform={data.platform} />
                        <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-md">
                            {data.title}
                        </h3>
                        <p className="text-gray-300 text-sm">{data.author}</p>
                    </div>
                </div>
            </div>

            {/* Metadata */}
            {data.metadata && (
                <div className="px-4 py-2 bg-black/20 flex items-center gap-4 text-xs text-gray-400">
                    {data.metadata.duration && (
                        <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {formatDuration(data.metadata.duration)}
                        </span>
                    )}
                    {data.metadata.views && (
                        <span>
                            👁️ {formatNumber(data.metadata.views)} views
                        </span>
                    )}
                    {data.metadata.uploadDate && (
                        <span>
                            📅 {data.metadata.uploadDate}
                        </span>
                    )}
                </div>
            )}

            {/* Download Options */}
            <div className="p-4 space-y-3">
                <div className="text-sm text-gray-400 font-medium">Download Options:</div>
                {data.downloads && data.downloads.length > 0 ? (
                    <div className="grid gap-2">
                        {data.downloads.map((download, index) => (
                            <a
                                key={index}
                                href={download.url}
                                onClick={(e) => handleDownload(e, download.url, `${data.title}.${download.type === 'video' ? 'mp4' : 'mp3'}`)}
                                className={`flex items-center justify-between gap-2 ${download.type === 'video'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                    : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                                    } text-white py-2.5 px-4 rounded-lg font-medium transition-all text-sm shadow-lg group cursor-pointer ${downloadingUrl === download.url ? 'opacity-75 cursor-wait' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    {download.type === 'video' ? (
                                        <Video className="w-4 h-4" />
                                    ) : (
                                        <Music className="w-4 h-4" />
                                    )}
                                    <span className="capitalize">{download.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                                        {download.quality}
                                    </span>
                                    {downloadingUrl === download.url ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4 group-hover:animate-bounce" />
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                        No download links available
                    </div>
                )}

                {/* Preview Audio for audio-only platforms */}
                {data.platform === 'spotify' && data.downloads[0]?.type === 'audio' && (
                    <audio
                        controls
                        src={data.downloads[0].url}
                        className="w-full h-8 accent-primary rounded-lg opacity-80 hover:opacity-100 transition-opacity mt-2"
                    />
                )}
            </div>

            {/* Description Preview (for YouTube) */}
            {data.metadata?.description && data.platform === 'youtube' && (
                <div className="px-4 pb-4">
                    <details className="text-xs text-gray-400">
                        <summary className="cursor-pointer hover:text-gray-300 font-medium">
                            Show description
                        </summary>
                        <p className="mt-2 line-clamp-4 leading-relaxed">
                            {data.metadata.description}
                        </p>
                    </details>
                </div>
            )}
        </div>
    );
};

export default MediaCard;
