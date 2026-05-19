interface ApiResponse {
    text?: string;
    error?: string;
    details?: string;
}

export interface BotAttachment {
    type: 'image';
    dataUrl: string;
}

export const sendMessageToBot = async (
    content: string,
    systemPrompt: string = "",
    attachments: BotAttachment[] = []
): Promise<string> => {
    try {
        const response = await fetch('/api/openrouter', {
            method: 'POST',
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
            throw new Error(data.details || data.error || `HTTP Error: ${response.status}`);
        }

        if (!data.text) {
            throw new Error('Tidak ada respons dari rizki.');
        }

        return data.text;
    } catch (error: any) {
        console.error('rizki API error:', error);
        throw new Error(error.message || "Gagal terhubung ke rizki.");
    }
};
