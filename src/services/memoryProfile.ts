export interface ProfileMemoryItem {
    id: string;
    text: string;
    category: string;
    createdAt: string;
}

export interface ContextHistoryItem {
    id: string;
    text: string;
    timeLabel: string;
}

export interface ImportantNote {
    id: string;
    text: string;
}

export interface MemoryProfile {
    user: {
        name: string;
        role: string;
        location: string;
        interests: string;
        goals: string;
        learningStyle: string;
    };
    preferences: {
        language: string;
        detailLevel: string;
        writingStyle: string;
        examples: string;
        answerFormat: string;
        references: string;
    };
    contextHistory: ContextHistoryItem[];
    importantNotes: ImportantNote[];
    memories: ProfileMemoryItem[];
}

const STORAGE_KEY = 'rizki_memory_profile';
const SETTINGS_STORAGE_KEY = 'rizki_memory_settings';

export interface MemorySettings {
    useProfileInChat: boolean;
    autoSaveContext: boolean;
    autoSaveExplicitMemory: boolean;
    includeImportantNotes: boolean;
    includeContextHistory: boolean;
    includeSavedMemories: boolean;
}

export const defaultMemorySettings: MemorySettings = {
    useProfileInChat: true,
    autoSaveContext: true,
    autoSaveExplicitMemory: true,
    includeImportantNotes: true,
    includeContextHistory: true,
    includeSavedMemories: true
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultMemoryProfile: MemoryProfile = {
    user: {
        name: 'Rizki',
        role: 'Mahasiswa',
        location: 'Bogor, Indonesia',
        interests: 'Teknologi, Desain, AI',
        goals: 'Belajar efektif dan produktif',
        learningStyle: 'Visual dan praktik'
    },
    preferences: {
        language: 'Indonesia',
        detailLevel: 'Sedang',
        writingStyle: 'Ramah dan jelas',
        examples: 'Disukai',
        answerFormat: 'Ringkas dan terstruktur',
        references: 'Disertakan jika ada'
    },
    contextHistory: [
        { id: 'context-1', text: 'Minta penjelasan tentang AI', timeLabel: '10:15' },
        { id: 'context-2', text: 'Buat ringkasan artikel machine learning', timeLabel: 'Kemarin' },
        { id: 'context-3', text: 'Diskusi tugas sistem pakar', timeLabel: '2 hari lalu' },
        { id: 'context-4', text: 'Minta ide proyek akhir', timeLabel: '3 hari lalu' },
        { id: 'context-5', text: 'Buat mindmap topik skripsi', timeLabel: '4 hari lalu' }
    ],
    importantNotes: [
        { id: 'note-1', text: 'Sedang mengerjakan skripsi tentang sistem rekomendasi.' },
        { id: 'note-2', text: 'Lebih nyaman dengan penjelasan bertahap.' },
        { id: 'note-3', text: 'Suka analogi sederhana dan contoh nyata.' },
        { id: 'note-4', text: 'Ingin meningkatkan kemampuan coding Python.' },
        { id: 'note-5', text: 'Menggunakan laptop untuk belajar setiap malam.' }
    ],
    memories: [
        { id: 'memory-1', text: 'Preferensi jawaban ringkas', category: 'Preferensi', createdAt: '2025-05-10' },
        { id: 'memory-2', text: 'Topik skripsi: sistem rekomendasi', category: 'Proyek', createdAt: '2025-05-08' },
        { id: 'memory-3', text: 'Belajar Python setiap malam', category: 'Kebiasaan', createdAt: '2025-05-06' }
    ]
};

const normalizeArray = <T>(value: unknown, fallback: T[]): T[] => {
    return Array.isArray(value) ? value : fallback;
};

const normalizeMemoryProfile = (value: unknown): MemoryProfile => {
    if (!value || typeof value !== 'object') return defaultMemoryProfile;

    const raw = value as Partial<MemoryProfile> & {
        name?: string;
        preferredTone?: string;
        interests?: string;
        responseStyle?: string;
    };

    if ('name' in raw || 'preferredTone' in raw || 'responseStyle' in raw) {
        return {
            ...defaultMemoryProfile,
            user: {
                ...defaultMemoryProfile.user,
                name: raw.name || defaultMemoryProfile.user.name,
                interests: raw.interests || defaultMemoryProfile.user.interests
            },
            preferences: {
                ...defaultMemoryProfile.preferences,
                writingStyle: raw.preferredTone || defaultMemoryProfile.preferences.writingStyle,
                answerFormat: raw.responseStyle || defaultMemoryProfile.preferences.answerFormat
            }
        };
    }

    return {
        user: { ...defaultMemoryProfile.user, ...(raw.user || {}) },
        preferences: { ...defaultMemoryProfile.preferences, ...(raw.preferences || {}) },
        contextHistory: normalizeArray(raw.contextHistory, defaultMemoryProfile.contextHistory),
        importantNotes: normalizeArray(raw.importantNotes, defaultMemoryProfile.importantNotes),
        memories: normalizeArray(raw.memories, defaultMemoryProfile.memories)
    };
};

export const createEmptyMemory = (): ProfileMemoryItem => ({
    id: createId('memory'),
    text: 'Memory baru',
    category: 'Umum',
    createdAt: new Date().toISOString().slice(0, 10)
});

export const createEmptyNote = (): ImportantNote => ({
    id: createId('note'),
    text: 'Catatan penting baru'
});

export const createEmptyContext = (): ContextHistoryItem => ({
    id: createId('context'),
    text: 'Konteks baru',
    timeLabel: 'Baru saja'
});

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

const isUsefulText = (value: string) => {
    const normalized = normalizeText(value).toLowerCase();
    return normalized.length > 0
        && normalized !== 'memory baru'
        && normalized !== 'catatan penting baru'
        && normalized !== 'konteks baru';
};

const stopWords = new Set([
    'aku',
    'anda',
    'atau',
    'bahwa',
    'bantu',
    'buat',
    'dan',
    'dengan',
    'di',
    'ini',
    'itu',
    'jadi',
    'ke',
    'mau',
    'saya',
    'sebagai',
    'tentang',
    'tolong',
    'untuk',
    'yang'
]);

const getKeywords = (value: string) => {
    return normalizeText(value)
        .toLowerCase()
        .split(/[^a-z0-9\u00c0-\u024f]+/i)
        .filter((word) => word.length > 2 && !stopWords.has(word));
};

const scoreText = (text: string, query: string) => {
    const keywords = getKeywords(query);
    if (keywords.length === 0) return 0;

    const haystack = normalizeText(text).toLowerCase();
    return keywords.reduce((score, keyword) => score + (haystack.includes(keyword) ? 1 : 0), 0);
};

const selectRelevantItems = <T>(
    items: T[],
    query: string,
    toText: (item: T) => string,
    limit: number
) => {
    const usefulItems = items.filter((item) => isUsefulText(toText(item)));
    if (!query.trim()) return usefulItems.slice(0, limit);

    const scored = usefulItems
        .map((item, index) => ({ item, index, score: scoreText(toText(item), query) }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index);

    return (scored.length > 0 ? scored.map((entry) => entry.item) : usefulItems).slice(0, limit);
};

const inferMemoryCategory = (text: string) => {
    const normalized = text.toLowerCase();

    if (/(suka|lebih nyaman|prefer|gaya|format|bahasa|ringkas|detail)/i.test(normalized)) {
        return 'Preferensi';
    }

    if (/(proyek|skripsi|tugas|kerja|deadline|aplikasi|website|bot)/i.test(normalized)) {
        return 'Proyek';
    }

    if (/(belajar|latihan|setiap|biasanya|kebiasaan|rutinitas)/i.test(normalized)) {
        return 'Kebiasaan';
    }

    return 'Umum';
};

const extractExplicitMemory = (message: string) => {
    const normalized = normalizeText(message);
    const patterns = [
        /^(?:tolong\s+)?ingat\s+(?:bahwa\s+)?(.+)$/i,
        /^(?:tolong\s+)?catat\s+(?:bahwa\s+)?(.+)$/i,
        /^simpan\s+(?:di\s+)?memori\s*:?\s*(.+)$/i,
        /^memory\s*:?\s*(.+)$/i
    ];

    for (const pattern of patterns) {
        const match = normalized.match(pattern);
        const text = match?.[1]?.trim();
        if (text && isUsefulText(text)) return text;
    }

    return '';
};

const createContextFromMessage = (message: string): ContextHistoryItem => {
    const text = normalizeText(message);
    const shortText = text.length > 140 ? `${text.slice(0, 137)}...` : text;

    return {
        id: createId('context'),
        text: shortText,
        timeLabel: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        })
    };
};

export const updateMemoryProfileFromChat = (
    profile: MemoryProfile,
    userMessage: string,
    settings: MemorySettings = defaultMemorySettings
): MemoryProfile => {
    const normalized = normalizeMemoryProfile(profile);
    const cleanMessage = normalizeText(userMessage);
    if (!isUsefulText(cleanMessage)) return normalized;

    const explicitMemory = extractExplicitMemory(cleanMessage);
    const existingMemoryTexts = new Set(normalized.memories.map((memory) => normalizeText(memory.text).toLowerCase()));
    const nextMemories = settings.autoSaveExplicitMemory && explicitMemory && !existingMemoryTexts.has(explicitMemory.toLowerCase())
        ? [
            {
                id: createId('memory'),
                text: explicitMemory,
                category: inferMemoryCategory(explicitMemory),
                createdAt: new Date().toISOString().slice(0, 10)
            },
            ...normalized.memories
        ]
        : normalized.memories;

    const contextText = createContextFromMessage(cleanMessage);
    const nextContextHistory = settings.autoSaveContext ? [
        contextText,
        ...normalized.contextHistory.filter((item) => normalizeText(item.text).toLowerCase() !== contextText.text.toLowerCase())
    ].slice(0, 12) : normalized.contextHistory;

    return {
        ...normalized,
        memories: nextMemories.slice(0, 40),
        contextHistory: nextContextHistory
    };
};

export const getMemoryProfile = (): MemoryProfile => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? normalizeMemoryProfile(JSON.parse(saved)) : defaultMemoryProfile;
    } catch {
        return defaultMemoryProfile;
    }
};

export const saveMemoryProfile = (profile: MemoryProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const getMemorySettings = (): MemorySettings => {
    try {
        const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return saved
            ? { ...defaultMemorySettings, ...JSON.parse(saved) }
            : defaultMemorySettings;
    } catch {
        return defaultMemorySettings;
    }
};

export const saveMemorySettings = (settings: MemorySettings) => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
};

export const buildMemoryPrompt = (
    profile: MemoryProfile,
    currentMessage = '',
    settings: MemorySettings = defaultMemorySettings
): string => {
    if (!settings.useProfileInChat) return '';

    const normalized = normalizeMemoryProfile(profile);
    const user = normalized.user;
    const preferences = normalized.preferences;
    const relevantNotes = settings.includeImportantNotes
        ? selectRelevantItems(normalized.importantNotes, currentMessage, (note) => note.text, 8)
        : [];
    const relevantMemories = settings.includeSavedMemories
        ? selectRelevantItems(normalized.memories, currentMessage, (memory) => `${memory.category} ${memory.text}`, 12)
        : [];
    const relevantContext = settings.includeContextHistory
        ? selectRelevantItems(normalized.contextHistory, currentMessage, (item) => `${item.text} ${item.timeLabel}`, 6)
        : [];

    const sections = [
        '[Aturan Penggunaan Memori]',
        'Gunakan memori ini untuk menyesuaikan jawaban, prioritas, contoh, tingkat detail, dan gaya bahasa.',
        'Jangan menyebut isi memori secara eksplisit kecuali pengguna bertanya atau konteksnya memang perlu.',
        'Jika ada konflik antara permintaan terbaru pengguna dan memori lama, ikuti permintaan terbaru.',
        '',
        '[Profil Pengguna]',
        user.name ? `Nama: ${user.name}` : '',
        user.role ? `Peran/Pekerjaan: ${user.role}` : '',
        user.location ? `Domisili: ${user.location}` : '',
        user.interests ? `Minat utama: ${user.interests}` : '',
        user.goals ? `Tujuan: ${user.goals}` : '',
        user.learningStyle ? `Gaya belajar: ${user.learningStyle}` : '',
        '',
        '[Preferensi Jawaban]',
        preferences.language ? `Bahasa: ${preferences.language}` : '',
        preferences.detailLevel ? `Tingkat detail: ${preferences.detailLevel}` : '',
        preferences.writingStyle ? `Gaya penulisan: ${preferences.writingStyle}` : '',
        preferences.examples ? `Contoh: ${preferences.examples}` : '',
        preferences.answerFormat ? `Format jawaban: ${preferences.answerFormat}` : '',
        preferences.references ? `Sumber referensi: ${preferences.references}` : '',
        '',
        '[Catatan Penting Relevan]',
        ...relevantNotes.map((note) => `- ${note.text}`),
        '',
        '[Memory Tersimpan Relevan]',
        ...relevantMemories.map((memory) => `- (${memory.category}) ${memory.text}`),
        '',
        '[Riwayat Konteks Relevan]',
        ...relevantContext.map((item) => `- ${item.text} (${item.timeLabel})`)
    ].filter((line) => line !== '');

    return sections.length > 0
        ? `\n\n[Memori Pengguna]\n${sections.join('\n')}\n[End Memori]`
        : '';
};
