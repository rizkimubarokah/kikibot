interface ApiResponse {
    text?: string;
    error?: string;
    details?: unknown;
}

export interface BotAttachment {
    type: 'image';
    dataUrl: string;
}

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
        const response = await fetch('/api/openrouter', {
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

        const data: ApiResponse = await response.json().catch(() => ({}));

        if (!response.ok) {
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
        throw new Error(error instanceof Error ? error.message : "Gagal terhubung ke rizki.");
    }
};
