// Enhanced Media Downloader Service using Ryzumi API
// Supports: YouTube (MP3/MP4), Instagram, TikTok, Spotify

export interface MediaData {
    platform: 'youtube' | 'instagram' | 'tiktok' | 'spotify';
    title: string;
    author: string;
    thumbnail: string;
    downloads: {
        type: 'audio' | 'video';
        url: string;
        quality: string;
    }[];
    metadata?: {
        duration?: number;
        views?: number;
        uploadDate?: string;
        description?: string;
    };
}

interface YouTubeResponse {
    title: string;
    author: string;
    authorUrl: string;
    lengthSeconds: number;
    views: number;
    uploadDate: string;
    thumbnail: string;
    description: string;
    videoUrl: string;
    url: string;
    quality: string;
}

const detectPlatform = (url: string): 'youtube' | 'instagram' | 'tiktok' | 'spotify' | null => {
    if (url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)/)) return 'youtube';
    if (url.match(/instagram\.com/)) return 'instagram';
    if (url.match(/tiktok\.com/)) return 'tiktok';
    if (url.match(/open\.spotify\.com/)) return 'spotify';
    return null;
};

const fetchYouTubeData = async (url: string): Promise<MediaData> => {
    // Fetch both MP3 and MP4 versions
    const [mp3Response, mp4Response] = await Promise.all([
        fetch(`https://api.ryzumi.vip/api/downloader/ytmp3?url=${encodeURIComponent(url)}`),
        fetch(`https://api.ryzumi.vip/api/downloader/ytmp4?url=${encodeURIComponent(url)}`)
    ]);

    if (!mp3Response.ok && !mp4Response.ok) {
        throw new Error('Failed to fetch YouTube data');
    }

    const mp3Data: YouTubeResponse = mp3Response.ok ? await mp3Response.json() : null;
    const mp4Data: YouTubeResponse = mp4Response.ok ? await mp4Response.json() : null;

    const data = mp3Data || mp4Data;

    const downloads: MediaData['downloads'] = [];

    if (mp3Data?.url) {
        downloads.push({
            type: 'audio',
            url: mp3Data.url,
            quality: mp3Data.quality || '320kbps'
        });
    }

    if (mp4Data?.url) {
        downloads.push({
            type: 'video',
            url: mp4Data.url,
            quality: mp4Data.quality || '720p'
        });
    }

    return {
        platform: 'youtube',
        title: data.title,
        author: data.author,
        thumbnail: data.thumbnail,
        downloads,
        metadata: {
            duration: data.lengthSeconds,
            views: data.views,
            uploadDate: data.uploadDate,
            description: data.description
        }
    };
};

const fetchInstagramData = async (url: string): Promise<MediaData> => {
    const response = await fetch(`https://api.ryzumi.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Instagram data');
    }

    const data = await response.json();

    if (!data.status) {
        throw new Error(data.msg || 'Failed to download Instagram media');
    }

    // Instagram API response structure may vary, adjust based on actual response
    return {
        platform: 'instagram',
        title: data.title || 'Instagram Media',
        author: data.author || 'Unknown',
        thumbnail: data.thumbnail || '',
        downloads: [{
            type: data.type === 'video' ? 'video' : 'audio',
            url: data.url || data.download,
            quality: data.quality || 'HD'
        }]
    };
};

const fetchTikTokData = async (url: string): Promise<MediaData> => {
    // Try ttdl endpoint first
    const response = await fetch(`https://api.ryzumi.vip/api/downloader/ttdl?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
        throw new Error('Failed to fetch TikTok data');
    }

    const json = await response.json();

    // Check for API level error
    if (!json.success && !json.data) {
        throw new Error(json.msg || json.message || 'Failed to download TikTok media');
    }

    // Check for internal data error (e.g. usage limit or parsing error)
    if (json.data?.code === -1) {
        throw new Error(json.data.msg || 'TikTok download failed - Invalid URL or Private Video');
    }

    // Handle Ryzumi structure: { success: true, data: { data: { ... } } }
    const validData = json.data?.data || json.data;

    if (!validData) {
        throw new Error('Invalid TikTok data structure received');
    }

    // Validate essential fields
    if (!validData.play && !validData.wmplay && !validData.url) {
        throw new Error('No video URL found in response');
    }

    return {
        platform: 'tiktok',
        title: validData.title || 'TikTok Video',
        author: validData.author?.nickname || validData.author?.unique_id || validData.author || 'Unknown',
        thumbnail: validData.cover || validData.origin_cover || '',
        downloads: [
            {
                type: 'video',
                url: validData.play || validData.wmplay || validData.url,
                quality: 'HD (No Watermark)'
            },
            {
                type: 'audio',
                url: validData.music,
                quality: 'Original Audio'
            }
        ],
        metadata: {
            duration: validData.duration,
            views: validData.play_count,
            description: validData.title
        }
    };
};

const fetchSpotifyData = async (url: string): Promise<MediaData> => {
    const response = await fetch(`https://api.ryzumi.vip/api/downloader/spotify?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Spotify data');
    }

    const json = await response.json();

    if (!json.success) {
        throw new Error(json.error || 'Failed to download Spotify track');
    }

    const metadata = json.metadata || {};

    return {
        platform: 'spotify',
        title: metadata.title || 'Spotify Track',
        author: metadata.artists || 'Unknown Artist',
        thumbnail: metadata.cover || '',
        downloads: [{
            type: 'audio',
            url: json.link,
            quality: '320kbps'
        }],
        metadata: {
            uploadDate: metadata.releaseDate,
            description: metadata.album ? `Album: ${metadata.album}` : undefined
        }
    };
};

export const fetchMediaData = async (url: string): Promise<MediaData | null> => {
    const platform = detectPlatform(url);

    if (!platform) {
        return null;
    }

    try {
        switch (platform) {
            case 'youtube':
                return await fetchYouTubeData(url);
            case 'instagram':
                return await fetchInstagramData(url);
            case 'tiktok':
                return await fetchTikTokData(url);
            case 'spotify':
                return await fetchSpotifyData(url);
            default:
                return null;
        }
    } catch (error) {
        console.error(`Error fetching ${platform} data:`, error);
        throw error;
    }
};
