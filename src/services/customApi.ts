interface ApiResponse {
    text?: string;
    error?: string;
    details?: unknown;
}

export interface BotAttachment {
    type: 'image';
    dataUrl: string;
}

const getApiEndpoint = () => {
    const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configuredBaseUrl) {
        return `${configuredBaseUrl.replace(/\/$/, '')}/api/openrouter`;
    }

    const isLocalBrowser = ['localhost', '127.0.0.1'].includes(window.location.hostname);
    if (isLocalBrowser && window.location.port !== '3000') {
        return 'http://localhost:3000/api/openrouter';
    }

    return '/api/openrouter';
};

const formatApiError = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);

    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        if (typeof record.message === 'string') return record.message;
        if (typeof record.error === 'string') return record.error;
        if (record.error) return formatApiError(record.error);
        if (record.details) return formatApiError(record.details);

        try {
            return JSON.stringify(value);
        } catch {
            return 'Error tidak dikenal dari API.';
        }
    }

    return String(value);
};

export const sendMessageToBot = async (
    content: string,
    systemPrompt: string = "",
    attachments: BotAttachment[] = [],
    signal?: AbortSignal
): Promise<string> => {
    try {
        const response = await fetch(getApiEndpoint(), {
            method: 'POST',
            signal,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: content,
                systemPrompt,
                attachments
            })
        });

        const rawBody = await response.text();
        let data: ApiResponse = {};
        try {
            data = rawBody ? JSON.parse(rawBody) as ApiResponse : {};
        } catch {
            data = {};
        }

        if (!response.ok) {
            if (response.status === 404 && rawBody.toLowerCase().includes('page could not be found')) {
                throw new Error('Server API lokal belum tersambung. Jalankan npm run dev supaya backend di port 3000 ikut hidup.');
            }

            throw new Error(formatApiError(data.details) || formatApiError(data.error) || `HTTP Error: ${response.status}`);
        }

        if (!data.text) {
            throw new Error('Tidak ada respons dari rizki.');
        }

        return data.text;
    } catch (error: unknown) {
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw error;
        }

        console.error('rizki API error:', error);
        if (error instanceof SyntaxError) {
            throw new Error('Respons API tidak valid. Pastikan server backend berjalan dengan npm run dev.');
        }

        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            throw new Error('Server API lokal belum aktif. Jalankan npm run dev lalu refresh halaman.');
        }

        throw new Error(error instanceof Error ? error.message : "Gagal terhubung ke rizki.");
    }
};
