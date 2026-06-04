export interface MemoryProfile {
    name: string;
    preferredTone: string;
    interests: string;
    responseStyle: string;
}

const STORAGE_KEY = 'rizki_memory_profile';

export const defaultMemoryProfile: MemoryProfile = {
    name: '',
    preferredTone: 'Ramah, jelas, dan santai',
    interests: '',
    responseStyle: 'Ringkas dulu, detail jika diminta'
};

export const getMemoryProfile = (): MemoryProfile => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...defaultMemoryProfile, ...JSON.parse(saved) } : defaultMemoryProfile;
    } catch {
        return defaultMemoryProfile;
    }
};

export const saveMemoryProfile = (profile: MemoryProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const buildMemoryPrompt = (profile: MemoryProfile): string => {
    const parts = [
        profile.name ? `Nama pengguna: ${profile.name}` : '',
        profile.preferredTone ? `Nada bicara favorit: ${profile.preferredTone}` : '',
        profile.interests ? `Minat/konteks pengguna: ${profile.interests}` : '',
        profile.responseStyle ? `Format jawaban favorit: ${profile.responseStyle}` : ''
    ].filter(Boolean);

    return parts.length > 0
        ? `\n\n[Memori Pengguna]\n${parts.join('\n')}\n[End Memori]`
        : '';
};
