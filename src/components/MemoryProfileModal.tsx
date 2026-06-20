import React, { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Brain,
    CheckCircle2,
    Clock3,
    Download,
    Edit3,
    FileText,
    Import,
    Info,
    Lightbulb,
    MessageCircle,
    Pin,
    Plus,
    RefreshCcw,
    Save,
    Search,
    Settings,
    Trash2,
    ToggleLeft,
    ToggleRight,
    Upload,
    UserRound,
    X
} from 'lucide-react';
import {
    createEmptyContext,
    createEmptyMemory,
    createEmptyNote,
    defaultMemoryProfile,
    type ContextHistoryItem,
    type MemoryProfile,
    type MemorySettings,
    type ProfileMemoryItem
} from '../services/memoryProfile';
import botAvatar from '../assets/hu-tao-profile.webp';

interface MemoryProfileModalProps {
    isOpen: boolean;
    profile: MemoryProfile;
    settings: MemorySettings;
    onClose: () => void;
    onSave: (profile: MemoryProfile) => void;
    onSaveSettings: (settings: MemorySettings) => void;
}

type UserField = keyof MemoryProfile['user'];
type PreferenceField = keyof MemoryProfile['preferences'];
type MemoryTab = 'chat' | 'memory' | 'documents' | 'settings';

const cloneProfile = (value: MemoryProfile): MemoryProfile => JSON.parse(JSON.stringify(value));

const formatDate = (date: string) => {
    const parsed = new Date(`${date}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const fieldLabels: Array<{ key: UserField; label: string }> = [
    { key: 'name', label: 'Nama' },
    { key: 'role', label: 'Peran' },
    { key: 'location', label: 'Domisili' },
    { key: 'interests', label: 'Minat' },
    { key: 'goals', label: 'Tujuan' },
    { key: 'learningStyle', label: 'Belajar' }
];

const preferenceLabels: Array<{ key: PreferenceField; label: string }> = [
    { key: 'language', label: 'Bahasa' },
    { key: 'detailLevel', label: 'Detail' },
    { key: 'writingStyle', label: 'Gaya' },
    { key: 'examples', label: 'Contoh' },
    { key: 'answerFormat', label: 'Format' },
    { key: 'references', label: 'Referensi' }
];

const panelClass = 'rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/20 backdrop-blur-xl';
const iconButtonClass = 'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-gray-400 transition-colors hover:bg-white/10 hover:text-white';
const inputClass = 'w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none placeholder:text-gray-500 transition focus:border-primary/60 focus:bg-black/30';
const tabButtonClass = (isActive: boolean) => `flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
    isActive
        ? 'border border-primary/50 bg-primary/10 font-semibold text-white'
        : 'text-gray-400 hover:bg-white/5 hover:text-white'
}`;

const MemoryProfileModal: React.FC<MemoryProfileModalProps> = ({ isOpen, profile, settings, onClose, onSave, onSaveSettings }) => {
    const [draft, setDraft] = useState<MemoryProfile>(() => cloneProfile(profile));
    const [draftSettings, setDraftSettings] = useState<MemorySettings>(() => ({ ...settings }));
    const [activeTab, setActiveTab] = useState<MemoryTab>('memory');
    const [query, setQuery] = useState('');
    const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
    const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);
    const memoryTextInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

    React.useEffect(() => {
        if (isOpen) {
            setDraft(cloneProfile(profile));
            setDraftSettings({ ...settings });
            setActiveTab('memory');
            setSaveState('idle');
            setQuery('');
            setEditingMemoryId(null);
        }
    }, [isOpen, profile, settings]);

    const filteredMemories = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return draft.memories;

        return draft.memories.filter((memory) =>
            `${memory.text} ${memory.category} ${memory.createdAt}`.toLowerCase().includes(normalized)
        );
    }, [draft.memories, query]);

    const filteredContext = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return draft.contextHistory;

        return draft.contextHistory.filter((item) =>
            `${item.text} ${item.timeLabel}`.toLowerCase().includes(normalized)
        );
    }, [draft.contextHistory, query]);

    const filteredNotes = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return draft.importantNotes;

        return draft.importantNotes.filter((note) => note.text.toLowerCase().includes(normalized));
    }, [draft.importantNotes, query]);

    const profileStats = [
        { label: 'Memori', value: draft.memories.length },
        { label: 'Catatan', value: draft.importantNotes.length },
        { label: 'Konteks', value: draft.contextHistory.length }
    ];

    const updateUser = (field: UserField, value: string) => {
        setDraft((prev) => ({ ...prev, user: { ...prev.user, [field]: value } }));
        setSaveState('idle');
    };

    const updatePreference = (field: PreferenceField, value: string) => {
        setDraft((prev) => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }));
        setSaveState('idle');
    };

    const updateMemory = (id: string, field: keyof ProfileMemoryItem, value: string) => {
        setDraft((prev) => ({
            ...prev,
            memories: prev.memories.map((memory) => memory.id === id ? { ...memory, [field]: value } : memory)
        }));
        setSaveState('idle');
    };

    const updateNote = (id: string, value: string) => {
        setDraft((prev) => ({
            ...prev,
            importantNotes: prev.importantNotes.map((note) => note.id === id ? { ...note, text: value } : note)
        }));
        setSaveState('idle');
    };

    const updateContext = (id: string, field: keyof ContextHistoryItem, value: string) => {
        setDraft((prev) => ({
            ...prev,
            contextHistory: prev.contextHistory.map((item) => item.id === id ? { ...item, [field]: value } : item)
        }));
        setSaveState('idle');
    };

    const addMemory = () => {
        const newMemory = createEmptyMemory();
        setDraft((prev) => ({ ...prev, memories: [newMemory, ...prev.memories] }));
        setEditingMemoryId(newMemory.id);
        setSaveState('idle');
        window.setTimeout(() => {
            memoryTextInputRefs.current[newMemory.id]?.focus();
        }, 0);
    };

    const addNote = () => {
        setDraft((prev) => ({ ...prev, importantNotes: [...prev.importantNotes, createEmptyNote()] }));
        setSaveState('idle');
    };

    const addContext = () => {
        setDraft((prev) => ({ ...prev, contextHistory: [createEmptyContext(), ...prev.contextHistory] }));
        setSaveState('idle');
    };

    const removeMemory = (id: string) => {
        setDraft((prev) => ({ ...prev, memories: prev.memories.filter((memory) => memory.id !== id) }));
        setEditingMemoryId((current) => current === id ? null : current);
        setSaveState('idle');
    };

    const removeNote = (id: string) => {
        setDraft((prev) => ({ ...prev, importantNotes: prev.importantNotes.filter((note) => note.id !== id) }));
        setSaveState('idle');
    };

    const removeContext = (id: string) => {
        setDraft((prev) => ({ ...prev, contextHistory: prev.contextHistory.filter((item) => item.id !== id) }));
        setSaveState('idle');
    };

    const saveDraft = () => {
        onSave(draft);
        onSaveSettings(draftSettings);
        setSaveState('saved');
    };

    const resetMemory = () => {
        const freshProfile = cloneProfile(defaultMemoryProfile);
        setDraft(freshProfile);
        setEditingMemoryId(null);
        onSave(freshProfile);
        setSaveState('saved');
    };

    const clearContextHistory = () => {
        setDraft((prev) => ({ ...prev, contextHistory: [] }));
        setSaveState('idle');
    };

    const clearSavedMemories = () => {
        setDraft((prev) => ({ ...prev, memories: [] }));
        setEditingMemoryId(null);
        setSaveState('idle');
    };

    const clearImportantNotes = () => {
        setDraft((prev) => ({ ...prev, importantNotes: [] }));
        setSaveState('idle');
    };

    const toggleSetting = (field: keyof MemorySettings) => {
        setDraftSettings((prev) => ({ ...prev, [field]: !prev[field] }));
        setSaveState('idle');
    };

    const exportMemory = () => {
        const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'rizki-memory-profile.json';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const importMemory = (file?: File) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = JSON.parse(String(reader.result)) as MemoryProfile;
                const nextProfile = {
                    ...cloneProfile(defaultMemoryProfile),
                    ...imported,
                    user: { ...defaultMemoryProfile.user, ...(imported.user || {}) },
                    preferences: { ...defaultMemoryProfile.preferences, ...(imported.preferences || {}) },
                    contextHistory: Array.isArray(imported.contextHistory) ? imported.contextHistory : defaultMemoryProfile.contextHistory,
                    importantNotes: Array.isArray(imported.importantNotes) ? imported.importantNotes : defaultMemoryProfile.importantNotes,
                    memories: Array.isArray(imported.memories) ? imported.memories : defaultMemoryProfile.memories
                };
                setDraft(nextProfile);
                setEditingMemoryId(null);
                onSave(nextProfile);
                setSaveState('saved');
            } catch {
                setSaveState('idle');
            }
        };
        reader.readAsText(file);
    };

    const navItems: Array<{ id: MemoryTab; label: string; icon: React.ReactNode; onClick?: () => void }> = [
        { id: 'chat', label: 'Chat', icon: <MessageCircle className="h-5 w-5" />, onClick: onClose },
        { id: 'memory', label: 'Memory Profile', icon: <Brain className="h-5 w-5" /> },
        { id: 'documents', label: 'Dokumen', icon: <FileText className="h-5 w-5" /> },
        { id: 'settings', label: 'Pengaturan', icon: <Settings className="h-5 w-5" /> }
    ];

    const renderSettingToggle = (field: keyof MemorySettings, title: string, description: string) => {
        const isEnabled = draftSettings[field];

        return (
            <button
                onClick={() => toggleSetting(field)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/5"
            >
                <span className="min-w-0">
                    <span className="block text-sm font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
                </span>
                <span className={isEnabled ? 'text-primary' : 'text-gray-600'}>
                    {isEnabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                </span>
            </button>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-3 py-4 backdrop-blur-md"
                    onMouseDown={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="grid h-[92dvh] w-full max-w-[1440px] grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-dark-lighter/95 text-white shadow-2xl shadow-black/60 backdrop-blur-2xl lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)_300px]"
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <aside className="hidden min-h-0 border-r border-white/10 bg-black/20 p-5 lg:flex lg:flex-col">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="relative h-12 w-12 shrink-0">
                                    <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gradient-to-tr from-primary to-accent shadow-lg shadow-primary/20">
                                        <img src={botAvatar} alt="rizki" className="h-full w-full object-cover" />
                                    </div>
                                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-dark-lighter bg-green-400" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="truncate text-lg font-bold tracking-wide">{draft.user.name || 'Rizki'}</h2>
                                    <p className="text-xs font-medium uppercase tracking-wider text-accent">Memory Online</p>
                                </div>
                            </div>

                            <button
                                onClick={addMemory}
                                className="mb-6 flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                            >
                                <Plus className="h-5 w-5" />
                                Memory Baru
                            </button>

                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Menu</p>
                            <nav className="space-y-2 text-sm">
                                {navItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            item.onClick?.();
                                        }}
                                        className={tabButtonClass(activeTab === item.id)}
                                    >
                                        <span className={activeTab === item.id ? 'text-primary' : ''}>{item.icon}</span>
                                        {item.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="mt-auto space-y-3">
                                <div className="grid grid-cols-3 gap-2">
                                    {profileStats.map((item) => (
                                        <div key={item.label} className="rounded-xl border border-white/10 bg-white/5 px-2 py-3 text-center">
                                            <p className="text-lg font-bold text-white">{item.value}</p>
                                            <p className="text-[11px] text-gray-500">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={resetMemory}
                                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-gray-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-white"
                                >
                                    <RefreshCcw className="h-4 w-4" />
                                    Reset Memory
                                </button>
                            </div>
                        </aside>

                        <main className="min-h-0 overflow-y-auto p-4 custom-scrollbar sm:p-6">
                            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                <div>
                                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                                        <Brain className="h-4 w-4" />
                                        Memori rizki
                                    </p>
                                    <h1 className="text-2xl font-bold tracking-wide text-white sm:text-3xl">
                                        {activeTab === 'chat' ? 'Chat' : activeTab === 'documents' ? 'Dokumen' : activeTab === 'settings' ? 'Pengaturan' : 'Memory Profile'}
                                    </h1>
                                    <p className="mt-1 text-sm text-gray-400">
                                        {activeTab === 'chat'
                                            ? 'Kembali ke ruang chat utama.'
                                            : activeTab === 'documents'
                                                ? 'Kelola file profil memori dan arsip cadangan.'
                                                : activeTab === 'settings'
                                                    ? 'Atur cara memori dipakai di chat.'
                                                    : 'Kelola profil, preferensi, dan catatan yang dipakai saat chat.'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <div className="flex h-11 min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3">
                                        <Search className="h-5 w-5 shrink-0 text-gray-500" />
                                        <input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Cari memori..."
                                            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                                        />
                                    </div>
                                    <button
                                        onClick={saveDraft}
                                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        {saveState === 'saved' ? 'Tersimpan' : 'Simpan'}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className={iconButtonClass}
                                        title="Tutup"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="mb-5 grid grid-cols-3 gap-2 lg:hidden">
                                {profileStats.map((item) => (
                                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3 text-center">
                                        <p className="text-xl font-bold">{item.value}</p>
                                        <p className="text-xs text-gray-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {activeTab === 'memory' && (
                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                                <section className={`${panelClass} p-4`}>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold">
                                            <UserRound className="h-5 w-5 text-primary" />
                                            Profil Pengguna
                                        </h3>
                                        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Edit
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {fieldLabels.map((field) => (
                                            <label key={field.key} className="grid gap-2 text-sm sm:grid-cols-[105px_minmax(0,1fr)] sm:items-center">
                                                <span className="text-gray-400">{field.label}</span>
                                                <input
                                                    value={draft.user[field.key]}
                                                    onChange={(event) => updateUser(field.key, event.target.value)}
                                                    className={inputClass}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <section className={`${panelClass} p-4`}>
                                    <div className="mb-4 flex items-center justify-between gap-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold">
                                            <MessageCircle className="h-5 w-5 text-secondary" />
                                            Preferensi Jawaban
                                        </h3>
                                        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                                            <Edit3 className="h-3.5 w-3.5" />
                                            Edit
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {preferenceLabels.map((field) => (
                                            <label key={field.key} className="grid gap-2 text-sm sm:grid-cols-[105px_minmax(0,1fr)] sm:items-center">
                                                <span className="text-gray-400">{field.label}</span>
                                                <input
                                                    value={draft.preferences[field.key]}
                                                    onChange={(event) => updatePreference(field.key, event.target.value)}
                                                    className={inputClass}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </section>

                                <section className={`${panelClass} p-4`}>
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold">
                                            <Clock3 className="h-5 w-5 text-accent" />
                                            Riwayat Konteks
                                        </h3>
                                        <button
                                            onClick={addContext}
                                            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Tambah
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredContext.map((item) => (
                                            <div key={item.id} className="grid gap-2 rounded-xl border border-white/5 bg-black/15 p-2 sm:grid-cols-[minmax(0,1fr)_90px_36px]">
                                                <input
                                                    value={item.text}
                                                    onChange={(event) => updateContext(item.id, 'text', event.target.value)}
                                                    className="min-w-0 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-white outline-none transition hover:border-white/10 focus:border-accent/60"
                                                />
                                                <input
                                                    value={item.timeLabel}
                                                    onChange={(event) => updateContext(item.id, 'timeLabel', event.target.value)}
                                                    className="rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-left text-xs text-gray-500 outline-none transition hover:border-white/10 focus:border-accent/60 sm:text-right"
                                                />
                                                <button
                                                    onClick={() => removeContext(item.id)}
                                                    className={iconButtonClass}
                                                    title="Hapus konteks"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className={`${panelClass} p-4`}>
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <h3 className="flex items-center gap-2 text-base font-semibold">
                                            <Pin className="h-5 w-5 text-primary" />
                                            Catatan Penting
                                        </h3>
                                        <button
                                            onClick={addNote}
                                            className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-gray-300 transition hover:bg-white/10 hover:text-white"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Catatan
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {filteredNotes.map((note) => (
                                            <div key={note.id} className="flex items-start gap-2 rounded-xl border border-white/5 bg-black/15 p-2">
                                                <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                                                <textarea
                                                    value={note.text}
                                                    onChange={(event) => updateNote(note.id, event.target.value)}
                                                    rows={2}
                                                    className="min-h-10 flex-1 resize-none rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm text-white outline-none transition hover:border-white/10 focus:border-primary/60"
                                                />
                                                <button
                                                    onClick={() => removeNote(note.id)}
                                                    className={iconButtonClass}
                                                    title="Hapus catatan"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                            )}

                            {activeTab === 'documents' && (
                            <section className={`${panelClass} space-y-4 p-4`}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 text-base font-semibold">
                                        <FileText className="h-5 w-5 text-accent" />
                                        Dokumen Memori
                                    </h3>
                                    <button
                                        onClick={saveDraft}
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan File
                                    </button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <button
                                        onClick={exportMemory}
                                        className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/5"
                                    >
                                        <Download className="h-5 w-5 text-primary" />
                                        <span className="text-sm font-semibold text-white">Export JSON</span>
                                        <span className="text-xs leading-5 text-gray-500">Simpan profil memori ke file JSON.</span>
                                    </button>
                                    <button
                                        onClick={() => importInputRef.current?.click()}
                                        className="flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 text-left transition hover:bg-white/5"
                                    >
                                        <Upload className="h-5 w-5 text-secondary" />
                                        <span className="text-sm font-semibold text-white">Import JSON</span>
                                        <span className="text-xs leading-5 text-gray-500">Muat profil dari file cadangan.</span>
                                    </button>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-gray-400">
                                    File yang diimpor akan dipakai langsung untuk chat setelah disimpan.
                                </div>
                            </section>
                            )}

                            {activeTab === 'settings' && (
                            <section className={`${panelClass} space-y-3 p-4`}>
                                <div className="flex items-center justify-between gap-3">
                                    <h3 className="flex items-center gap-2 text-base font-semibold">
                                        <Settings className="h-5 w-5 text-primary" />
                                        Pengaturan Memori
                                    </h3>
                                    <button
                                        onClick={saveDraft}
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Simpan
                                    </button>
                                </div>
                                {renderSettingToggle(
                                    'useProfileInChat',
                                    'Gunakan profil di chat',
                                    'Kalau mati, profil tidak disisipkan ke prompt percakapan.'
                                )}
                                {renderSettingToggle(
                                    'autoSaveContext',
                                    'Simpan konteks otomatis',
                                    'Pesan baru akan dicatat sebagai riwayat konteks.'
                                )}
                                {renderSettingToggle(
                                    'autoSaveExplicitMemory',
                                    'Simpan perintah ingat',
                                    'Kalimat seperti "ingat bahwa..." akan masuk ke memori tersimpan.'
                                )}
                                {renderSettingToggle(
                                    'includeImportantNotes',
                                    'Pakai catatan penting',
                                    'Catatan akan dipertimbangkan saat menyusun jawaban.'
                                )}
                                {renderSettingToggle(
                                    'includeContextHistory',
                                    'Pakai riwayat konteks',
                                    'Riwayat percakapan relevan ikut membantu jawaban.'
                                )}
                                {renderSettingToggle(
                                    'includeSavedMemories',
                                    'Pakai memory tersimpan',
                                    'Daftar memory lama ikut dipakai untuk konteks chat.'
                                )}
                                <div className="grid gap-2 sm:grid-cols-3">
                                    <button onClick={clearContextHistory} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5">Bersihkan konteks</button>
                                    <button onClick={clearImportantNotes} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5">Bersihkan catatan</button>
                                    <button onClick={clearSavedMemories} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5">Bersihkan memory</button>
                                </div>
                            </section>
                            )}

                            {activeTab === 'memory' && (
                            <section className={`${panelClass} mt-4 p-4`}>
                                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="flex items-center gap-2 text-base font-semibold">
                                        <Brain className="h-5 w-5 text-primary" />
                                        Kelola Memory
                                    </h3>
                                    <button
                                        onClick={addMemory}
                                        className="flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-gray-200 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <Plus className="h-5 w-5" />
                                        Tambah Memory
                                    </button>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-white/10">
                                    <table className="w-full min-w-[720px] border-collapse text-sm">
                                        <thead className="bg-black/30">
                                            <tr className="text-left text-xs uppercase tracking-wider text-gray-500">
                                                <th className="px-4 py-3 font-semibold">Memory</th>
                                                <th className="px-4 py-3 font-semibold">Kategori</th>
                                                <th className="px-4 py-3 font-semibold">Dibuat</th>
                                                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredMemories.map((memory) => {
                                                const isEditing = editingMemoryId === memory.id;

                                                return (
                                                <tr key={memory.id} className={`border-t border-white/10 transition ${isEditing ? 'bg-primary/10' : ''}`}>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            ref={(node) => {
                                                                memoryTextInputRefs.current[memory.id] = node;
                                                            }}
                                                            value={memory.text}
                                                            readOnly={!isEditing}
                                                            onClick={() => {
                                                                if (!isEditing) {
                                                                    setEditingMemoryId(memory.id);
                                                                    window.setTimeout(() => memoryTextInputRefs.current[memory.id]?.focus(), 0);
                                                                }
                                                            }}
                                                            onChange={(event) => updateMemory(memory.id, 'text', event.target.value)}
                                                            className={`h-10 w-full rounded-xl border bg-transparent px-2 text-white outline-none transition ${
                                                                isEditing
                                                                    ? 'border-primary/50 bg-black/20'
                                                                    : 'cursor-pointer border-transparent hover:border-white/10'
                                                            }`}
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            value={memory.category}
                                                            readOnly={!isEditing}
                                                            onChange={(event) => updateMemory(memory.id, 'category', event.target.value)}
                                                            onClick={() => {
                                                                if (!isEditing) {
                                                                    setEditingMemoryId(memory.id);
                                                                    window.setTimeout(() => memoryTextInputRefs.current[memory.id]?.focus(), 0);
                                                                }
                                                            }}
                                                            className={`h-10 w-full rounded-xl border bg-transparent px-2 text-white outline-none transition ${
                                                                isEditing
                                                                    ? 'border-primary/50 bg-black/20'
                                                                    : 'cursor-pointer border-transparent hover:border-white/10'
                                                            }`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-gray-500">{formatDate(memory.createdAt)}</td>
                                                    <td className="px-3 py-2">
                                                        <div className="flex justify-end gap-1">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingMemoryId((current) => current === memory.id ? null : memory.id);
                                                                    if (editingMemoryId !== memory.id) {
                                                                        window.setTimeout(() => memoryTextInputRefs.current[memory.id]?.focus(), 0);
                                                                    }
                                                                }}
                                                                className={`${iconButtonClass} ${isEditing ? 'bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary' : ''}`}
                                                                title={isEditing ? 'Selesai edit' : 'Edit memory'}
                                                            >
                                                                {isEditing ? <CheckCircle2 className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                                                            </button>
                                                            <button
                                                                onClick={() => removeMemory(memory.id)}
                                                                className={iconButtonClass}
                                                                title="Hapus memory"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                            })}
                                        </tbody>
                                    </table>
                                    {filteredMemories.length === 0 && (
                                        <div className="border-t border-white/10 px-4 py-8 text-center text-sm text-gray-500">
                                            Memory tidak ditemukan.
                                        </div>
                                    )}
                                </div>
                            </section>
                            )}
                        </main>

                        <aside className="hidden min-h-0 overflow-y-auto border-l border-white/10 bg-black/20 p-5 custom-scrollbar xl:block">
                            <section className={`${panelClass} mb-4 p-4`}>
                                <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Info rizki</p>
                                <div className="flex items-center gap-4">
                                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                                        <Brain className="h-7 w-7" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="truncate text-lg font-bold">{draft.user.name || 'Rizki'}</h3>
                                        <p className="text-sm text-gray-400">{draft.user.role || 'Asisten Pribadi'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-gray-400">
                                    <p className="truncate">Domisili: {draft.user.location || '-'}</p>
                                    <p className="truncate">Minat: {draft.user.interests || '-'}</p>
                                </div>
                            </section>

                            <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <Info className="h-4 w-4" />
                                    Memory Profile
                                </h3>
                                <p className="text-sm leading-6 text-gray-400">
                                    Profil ini membuat jawaban rizki mengikuti konteks, gaya bahasa, dan hal penting yang kamu simpan.
                                </p>
                            </section>

                            <section className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <Lightbulb className="h-4 w-4" />
                                    Tips
                                </h3>
                                <ul className="space-y-3 text-sm leading-6 text-gray-400">
                                    <li>Perbarui memory proyek aktif.</li>
                                    <li>Hapus catatan yang tidak relevan.</li>
                                    <li>Simpan preferensi jawaban yang paling sering dipakai.</li>
                                </ul>
                            </section>

                            <section className={`${panelClass} p-4`}>
                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi Cepat</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={exportMemory}
                                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export Memory
                                    </button>
                                    <button
                                        onClick={() => importInputRef.current?.click()}
                                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Import Memory
                                    </button>
                                    <button
                                        onClick={saveDraft}
                                        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan Semua
                                    </button>
                                </div>
                            </section>
                        </aside>

                        <div className="grid grid-cols-4 border-t border-white/10 bg-dark-lighter/95 lg:hidden">
                            <button onClick={() => { setActiveTab('memory'); addMemory(); }} className="flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-gray-300">
                                <Plus className="h-5 w-5" />
                                Memory
                            </button>
                            <button onClick={() => { setActiveTab('documents'); importInputRef.current?.click(); }} className="flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-gray-300">
                                <Import className="h-5 w-5" />
                                Import
                            </button>
                            <button onClick={() => { setActiveTab('documents'); exportMemory(); }} className="flex h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-gray-300">
                                <Download className="h-5 w-5" />
                                Export
                            </button>
                            <button onClick={saveDraft} className="flex h-14 flex-col items-center justify-center gap-1 text-xs font-semibold text-primary">
                                <Save className="h-5 w-5" />
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>

                        <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json"
                            className="hidden"
                            onChange={(event) => {
                                importMemory(event.target.files?.[0]);
                                event.target.value = '';
                            }}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MemoryProfileModal;
