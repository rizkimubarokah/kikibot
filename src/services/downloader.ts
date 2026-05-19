export interface MusicData {
    title: string;
    author: string;
    thumbnail: string;
    url: string; // The MP3 download link
    views: number;
    lengthSeconds: number;
}

export const fetchMusicData = async (videoUrl: string): Promise<MusicData | null> => {
    try {
        // Check if Spotify
        if (videoUrl.includes('spotify.com')) {
            const apiUrl = `https://api.ryzumi.vip/api/downloader/spotify?url=${encodeURIComponent(videoUrl)}`;
            const response = await fetch(apiUrl);
            if (!response.ok) return null;
            const data = await response.json();

            if (!data.success || !data.link) return null;

            return {
                title: data.metadata.title,
                author: data.metadata.artists,
                thumbnail: data.metadata.cover,
                url: data.link,
                views: 0,
                lengthSeconds: 0
            };
        }

        // Default: YouTube
        const apiUrl = `https://api.ryzumi.vip/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) return null;

        const data = await response.json();

        // Basic validation
        if (!data.url || !data.title) return null;

        return {
            title: data.title,
            author: data.author || 'Unknown Artist',
            thumbnail: data.thumbnail,
            url: data.url,
            views: data.views,
            lengthSeconds: data.lengthSeconds
        };
    } catch (error) {
        console.error("Music fetch error:", error);
        return null;
    }
};
