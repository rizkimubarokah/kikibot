import type { ChatSession, Message } from '../types';

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleString('id-ID');

export const buildChatMarkdown = (session: ChatSession | undefined, messages: Message[]): string => {
    const title = session?.title || 'Chat rizki';
    const created = session ? formatDate(session.timestamp) : formatDate(Date.now());

    const body = messages.map((message) => {
        const sender = message.sender === 'bot' ? 'rizki' : 'User';
        const attachments = [
            message.imageUrl ? `\n\n[Gambar]: ${message.imageUrl}` : '',
            message.mediaData ? `\n\n[Media]: ${message.mediaData.title}` : '',
            message.weatherData ? '\n\n[Data cuaca terlampir]' : '',
            message.medicalData ? '\n\n[Data fakta medis terlampir]' : ''
        ].join('');

        return `## ${sender} - ${formatDate(message.timestamp)}\n\n${message.text}${attachments}`;
    }).join('\n\n---\n\n');

    return `# ${title}\n\nDiekspor: ${created}\n\n---\n\n${body}\n`;
};

export const downloadMarkdown = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
