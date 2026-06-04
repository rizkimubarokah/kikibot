
export const generateImage = (prompt: string): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    // Using Siputzx Flux API
    return `https://api.siputzx.my.id/api/ai/flux?prompt=${encodedPrompt}`;
};

export const extractImagePrompt = (input: string): string | null => {
    const text = input.trim();
    if (!text) return null;

    const patterns = [
        /^\/(?:image|gambar|img)\s+(.+)$/i,
        /^(?:tolong\s+)?(?:buatkan|buat|bikin|generate|ciptakan)\s+(?:sebuah\s+|satu\s+)?(?:gambar|foto|image|ilustrasi|poster|wallpaper|logo)\s+(.+)$/i,
        /^(?:tolong\s+)?(?:gambarkan|lukiskan|visualisasikan)\s+(.+)$/i,
        /^(?:aku\s+)?(?:mau|ingin|pengen)\s+(?:dibuatkan\s+)?(?:gambar|foto|image|ilustrasi|poster|wallpaper|logo)\s+(.+)$/i
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        const prompt = match?.[1]?.trim();
        if (prompt) return prompt;
    }

    return null;
};
