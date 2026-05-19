
export const generateImage = (prompt: string): string => {
    const encodedPrompt = encodeURIComponent(prompt);
    // Using Siputzx Flux API
    return `https://api.siputzx.my.id/api/ai/flux?prompt=${encodedPrompt}`;
};
