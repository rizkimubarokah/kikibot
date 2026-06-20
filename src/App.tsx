import { useState, useRef, useEffect } from 'react';
import ChatContainer from './components/ChatContainer';
import ChatHeader from './components/ChatHeader';
import ChatBubble from './components/ChatBubble';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import QuickReplies from './components/QuickReplies';
import ThemeSwitcher from './components/ThemeSwitcher';
import type { Theme } from './components/ThemeSwitcher';
import PersonaSelector from './components/PersonaSelector';
import type { Persona } from './components/PersonaSelector';
import Sidebar from './components/Sidebar';
import GameModal from './components/games/GameModal';
import TicTacToe from './components/games/TicTacToe';
import RockPaperScissors from './components/games/RockPaperScissors';
import HorrorNovel from './components/games/HorrorNovel';
import InsomniaGame from './components/games/InsomniaGame';
import type { Message, ChatSession } from './types';
import botAvatar from './assets/hu-tao-profile.webp';
import WelcomeDashboard from './components/WelcomeDashboard';
import { sendMessageToBot } from './services/customApi';
import { fetchMediaData } from './services/mediaDownloader';
import { extractImagePrompt, generateImage } from './services/imageGenerator';
import { extractTextFromPDF } from './services/pdfParser';
import { extractTextFromImage } from './services/ocrService';
import { speakText, stopSpeaking } from './services/voiceService';
import { getMedicalFunFacts } from './services/medicalService';
import { getWeather } from './services/weatherService';
import DynamicBackground from './components/DynamicBackground';
import { parseReminderRequest, saveReminder } from './services/reminderService';
import NotificationManager from './components/NotificationManager';
import EmotionVignette, { type Emotion } from './components/EmotionVignette';
import { soundManager } from './utils/soundManager';
import CommandPalette from './components/CommandPalette';
import type { CommandId } from './components/CommandPalette';
import MemoryProfileModal from './components/MemoryProfileModal';
import AboutRizkiModal from './components/AboutRizkiModal';
import {
  buildMemoryPrompt,
  defaultMemoryProfile,
  defaultMemorySettings,
  getMemorySettings,
  getMemoryProfile,
  saveMemorySettings,
  saveMemoryProfile,
  type MemorySettings,
  updateMemoryProfileFromChat,
  type MemoryProfile
} from './services/memoryProfile';
import { buildChatMarkdown, downloadMarkdown } from './services/chatExport';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

const resizeImageForVision = async (file: File): Promise<string> => {
  const originalDataUrl = await fileToDataUrl(file);

  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const maxSide = 1280;
      const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        resolve(originalDataUrl);
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    image.onerror = () => resolve(originalDataUrl);
    image.src = originalDataUrl;
  });
};

const DEFAULT_WEATHER_LOCATION = 'Jakarta';
type DisplayMode = 'compact' | 'comfortable';
const DISPLAY_MODE_STORAGE_KEY = 'rizki_display_mode';
const APP_VERSION = '0.0.0';

const createInitialBotMessage = (): Message => ({
  id: Date.now(),
  sender: 'bot',
  text: "Halo! Aku rizki, asisten virtualmu. Ada yang bisa aku bantu hari ini? 🚀🌌",
  timestamp: Date.now(),
});

const cleanWeatherLocation = (value: string) => {
  const cleaned = value
    .replace(/\b(?:hari ini|besok|malam ini|sekarang|nanti|dong|ya|tolong|please)\b/gi, ' ')
    .replace(/[?.!,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length >= 2 ? cleaned : DEFAULT_WEATHER_LOCATION;
};

const extractWeatherLocation = (text: string) => {
  const normalized = text.trim().replace(/\s+/g, ' ');
  const explicitMatch = normalized.match(/^(?:\/weather|cek cuaca|info cuaca|cuaca)\s+(.+)$/i);
  if (explicitMatch?.[1]) {
    const explicitText = explicitMatch[1].trim();
    const locationAfterPreposition = explicitText.match(/\b(?:di|untuk|pada)\s+(.+)$/i)?.[1];
    return cleanWeatherLocation(locationAfterPreposition || explicitText);
  }

  const inlineMatch = normalized.match(/\b(?:cuaca|hujan|panas|dingin|suhu|prakiraan)\b(?:\s+(?:hari ini|besok|malam ini))?(?:\s+(?:di|untuk|pada)\s+(.+))?/i);
  const location = inlineMatch?.[1]?.trim();
  if (location) {
    return cleanWeatherLocation(location);
  }

  return inlineMatch ? DEFAULT_WEATHER_LOCATION : '';
};



function App() {
  // Chat History Management
  const [isMuted, setIsMuted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('chat_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem('current_session_id') || `session-${Date.now()}`;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    // If sessions exist, find current session's messages
    const savedSessions = localStorage.getItem('chat_sessions');
    const savedCurrentId = localStorage.getItem('current_session_id');

    if (savedSessions && savedCurrentId) {
      const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
      const session = parsedSessions.find(s => s.id === savedCurrentId);
      if (session) return session.messages;
    }

    // Fallback: Check for old single-session messages
    const oldMessages = localStorage.getItem('chat_messages');
    if (oldMessages) return JSON.parse(oldMessages);

    // Default init
    return [createInitialBotMessage()];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [currentTheme, setCurrentTheme] = useState<Theme>('auto');
  const [currentPersona, setCurrentPersona] = useState<Persona>('default');
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    const savedMode = localStorage.getItem(DISPLAY_MODE_STORAGE_KEY);
    return savedMode === 'compact' ? 'compact' : 'comfortable';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isResponsePlaying, setIsResponsePlaying] = useState(false);
  const [stopAnimationToken, setStopAnimationToken] = useState(0);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [memoryProfile, setMemoryProfile] = useState<MemoryProfile>(() => getMemoryProfile());
  const [memorySettings, setMemorySettings] = useState<MemorySettings>(() => getMemorySettings());
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const responseTimeoutRef = useRef<number | null>(null);
  const playbackTimeoutRef = useRef<number | null>(null);
  const playbackTokenRef = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Save sessions and current session ID
  useEffect(() => {
    localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    localStorage.setItem('current_session_id', currentSessionId);
  }, [sessions, currentSessionId]);

  // Sync current messages to sessions state
  useEffect(() => {
    setSessions(prev => {
      const existingIndex = prev.findIndex(s => s.id === currentSessionId);

      const firstUserMessage = messages.find(m => m.sender === 'user');
      const title = firstUserMessage ? firstUserMessage.text.slice(0, 30) + (firstUserMessage.text.length > 30 ? '...' : '') : 'New Chat';

      if (existingIndex >= 0) {
        const newSessions = [...prev];
        newSessions[existingIndex] = {
          ...newSessions[existingIndex],
          messages,
          title: existingIndex === 0 && prev[existingIndex].title === 'New Chat' ? title : prev[existingIndex].title // Update title if it was default
        };
        // Update title if it's "New Chat" and we have a user message
        if (newSessions[existingIndex].title === 'New Chat' && firstUserMessage) {
          newSessions[existingIndex].title = title;
        }
        return newSessions;
      } else {
        // Create new session if not exists
        return [{
          id: currentSessionId,
          title,
          messages,
          timestamp: Date.now()
        }, ...prev];
      }
    });
  }, [messages, currentSessionId]);

  const handleNewChat = () => {
    const newId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const initialMessage = createInitialBotMessage();

    // Save current session state before switching
    setSessions(prev => {
      const updatedSessions = [...prev];
      const currentIndex = updatedSessions.findIndex(s => s.id === currentSessionId);
      if (currentIndex !== -1) {
        updatedSessions[currentIndex] = { ...updatedSessions[currentIndex], messages };
      }

      return [{
        id: newId,
        title: 'New Chat',
        messages: [initialMessage],
        timestamp: Date.now()
      }, ...updatedSessions];
    });

    setCurrentSessionId(newId);
    setMessages([initialMessage]);
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages);
      setIsSidebarOpen(false);
    }
  };

  const handlePinSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const updated = prev.map(s => s.id === sessionId ? { ...s, isPinned: !s.isPinned } : s);
      return updated.sort((a, b) => {
        if (a.isPinned === b.isPinned) return b.timestamp - a.timestamp;
        return a.isPinned ? -1 : 1;
      });
    });
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);

      // If we deleted the current session
      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          // Switch to first available
          setCurrentSessionId(filtered[0].id);
          setMessages(filtered[0].messages);
        } else {
          // Return to clean slate
          const newId = `session-${Date.now()}`;
          const initialMessage = createInitialBotMessage();
          setCurrentSessionId(newId);
          setMessages([initialMessage]);
          // Need to update state immediately or next render will handle empty logic?
          // The setSessions call above will update state. But we are inside the callback.
          // It's safer to return the empty session if filtered is empty.
          return [{
            id: newId,
            title: 'New Chat',
            messages: [initialMessage],
            timestamp: Date.now()
          }];
        }
      }

      return filtered;
    });
  };

  useEffect(() => {
    // Remove all previous theme classes
    document.body.classList.remove('theme-cyberpunk', 'theme-pastel', 'theme-matrix');

    // Add new theme class if not default
    if (currentTheme !== 'default') {
      document.body.classList.add(`theme-${currentTheme}`);
    }
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem(DISPLAY_MODE_STORAGE_KEY, displayMode);
  }, [displayMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSaveMemoryProfile = (profile: MemoryProfile) => {
    setMemoryProfile(profile);
    saveMemoryProfile(profile);
  };

  const handleSaveMemorySettings = (settings: MemorySettings) => {
    setMemorySettings(settings);
    saveMemorySettings(settings);
  };

  const handleExportChat = () => {
    const session = sessions.find(s => s.id === currentSessionId);
    const title = (session?.title || 'chat-rizki').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const markdown = buildChatMarkdown(session, messages);
    downloadMarkdown(`${title || 'chat-rizki'}.md`, markdown);
  };

  const handleResetAppData = () => {
    handleStopResponse();

    const newSessionId = `session-${Date.now()}`;
    const initialMessage = createInitialBotMessage();
    const initialSession: ChatSession = {
      id: newSessionId,
      title: 'New Chat',
      messages: [initialMessage],
      timestamp: Date.now()
    };

    localStorage.removeItem('chat_messages');
    localStorage.removeItem('chat_sessions');
    localStorage.removeItem('current_session_id');
    localStorage.removeItem('chat_reminders');
    localStorage.removeItem(DISPLAY_MODE_STORAGE_KEY);

    saveMemoryProfile(defaultMemoryProfile);
    saveMemorySettings(defaultMemorySettings);

    setSessions([initialSession]);
    setCurrentSessionId(newSessionId);
    setMessages([initialMessage]);
    setMemoryProfile(defaultMemoryProfile);
    setMemorySettings(defaultMemorySettings);
    setDisplayMode('comfortable');
    setHistorySearchQuery('');
    setEmotion('neutral');
    setIsSidebarOpen(false);
    setIsMemoryOpen(false);
    setIsCommandPaletteOpen(false);
    setActiveGame(null);
  };

  const totalMessageCount = sessions.reduce((count, session) => count + session.messages.length, 0);

  const handleRunCommand = (command: CommandId) => {
    if (command === 'new-chat') {
      handleNewChat();
      return;
    }

    if (command === 'search') {
      setIsSidebarOpen(true);
      setHistorySearchQuery('');
      return;
    }

    if (command === 'memory') {
      setIsMemoryOpen(true);
      return;
    }

    if (command === 'export') {
      handleExportChat();
      return;
    }

    if (command === 'game') {
      setActiveGame('tictactoe');
      return;
    }

    const commandPrompts: Record<Exclude<CommandId, 'new-chat' | 'search' | 'memory' | 'export' | 'game'>, string> = {
      'image-studio': 'Bantu aku membuat prompt gambar modern. Tanyakan rasio, gaya visual, subjek, mood, dan detail penting.',
      'study-mode': 'Aktifkan mode belajar. Bantu aku membuat rangkuman, kuis, flashcard, dan latihan dari materi yang aku kirim.',
      'daily-brief': 'Buatkan brief harian: fokus utama, agenda, cuaca yang perlu dicek, dan 3 prioritas hari ini.',
      weather: 'cek cuaca Jakarta'
    };

    handleSendMessage(commandPrompts[command]);
  };

  const handleStopResponse = () => {
    activeRequestRef.current?.abort();
    activeRequestRef.current = null;

    if (responseTimeoutRef.current !== null) {
      window.clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }

    if (playbackTimeoutRef.current !== null) {
      window.clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    playbackTokenRef.current += 1;

    setIsTyping(false);
    setIsResponsePlaying(false);
    setStopAnimationToken((prev) => prev + 1);
    setEmotion('neutral');
    stopSpeaking();
  };

  const handleSendMessage = async (text: string, file?: File) => {
    handleStopResponse();

    const trimmedText = text.trim();
    const outgoingText = trimmedText || (file?.type.startsWith('image/')
      ? 'Tolong jelaskan isi gambar ini.'
      : 'Tolong bantu analisis file ini.');

    const newUserMessage: Message = {
      id: Date.now(),
      sender: 'user',
      text: file ? `[Attached: ${file.name}] ${outgoingText}` : outgoingText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setMemoryProfile((prev) => {
      const nextProfile = updateMemoryProfileFromChat(prev, outgoingText, memorySettings);
      saveMemoryProfile(nextProfile);
      return nextProfile;
    });
    setIsTyping(true);
    const requestController = new AbortController();
    activeRequestRef.current = requestController;

    try {
      let contextContent = "";
      const attachments: { type: 'image'; dataUrl: string }[] = [];

      if (file) {
        try {
          let extractedText = "";
          if (file.type === 'application/pdf') {
            extractedText = await extractTextFromPDF(file);
          } else if (file.type.startsWith('image/')) {
            attachments.push({
              type: 'image',
              dataUrl: await resizeImageForVision(file)
            });

            try {
              extractedText = await extractTextFromImage(file);
            } catch (ocrError) {
              console.warn("OCR skipped:", ocrError);
            }
          }
          if (extractedText) {
            // Sanitize text: remove newlines and extra spaces to prevent URL issues
            const cleanText = extractedText.replace(/\s+/g, ' ').trim();

            const truncatedText = cleanText.length > 2000 ? cleanText.substring(0, 2000) + "...[Dipangkas agar respons tetap cepat]" : cleanText;

            contextContent = `\n\n[File Context]\n${truncatedText}\n[End File Context]`;
          }
        } catch (e) {
          console.error("File reading error:", e);
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: 'bot',
            text: "Maaf, file itu belum bisa aku baca. Pastikan formatnya PDF atau gambar yang valid.",
            timestamp: Date.now()
          }]);
          setIsTyping(false);
          return;
        }
      }

      // Check for Media Link (YouTube, Instagram, TikTok, Spotify)
      // Check for Media Link (YouTube, Instagram, TikTok, Spotify)
      const mediaRegex = /(?:https?:\/\/)?(?:www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|instagram\.com\/p\/|instagram\.com\/reel\/|tiktok\.com\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/|open\.spotify\.com\/track\/)([^\s]+)/;
      const mediaMatch = outgoingText.match(mediaRegex);

      if (mediaMatch) {
        try {
          const mediaUrl = mediaMatch[0].startsWith('http') ? mediaMatch[0] : `https://${mediaMatch[0]}`;
          const mediaData = await fetchMediaData(mediaUrl);

          if (mediaData) {
            const platformLabels = {
              youtube: '🎥 Video YouTube',
              instagram: '📸 Media Instagram',
              tiktok: '🎬 Video TikTok',
              spotify: '🎵 Lagu Spotify'
            };
            const label = platformLabels[mediaData.platform] || 'Media';
            const botMessage: Message = {
              id: Date.now() + 1,
              sender: 'bot',
              text: `Ditemukan ${label}: **${mediaData.title}**`,
              timestamp: Date.now(),
              mediaData: mediaData
            };
            setMessages((prev) => [...prev, botMessage]);
            setIsTyping(false);
            return;
          }
        } catch (error) {
          console.error('Media fetch error:', error);
          const errorMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `⚠️ **Gagal mengunduh media.**\n\nSepertinya ada masalah saat mengambil data dari link tersebut. Pastikan link bersifat publik dan tidak dihapus.\n\n_Error: ${(error as Error).message}_`,
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Check for Image Generation Command
      const imagePrompt = extractImagePrompt(outgoingText);

      if (imagePrompt) {
        const imageUrl = generateImage(imagePrompt);

        const botMessage: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Siap, aku buatkan gambar untuk: **${imagePrompt}**`,
          timestamp: Date.now(),
          imageUrl: imageUrl
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        return;
      }

      // Check for Medical Facts Command
      // Pattern: /medical YYYY-MM-DD or cek medis YYYY-MM-DD
      const medicalRegex = /^(?:\/medical|cek medis|fakta medis|cek kesehatan)\s+(\d{4}-\d{2}-\d{2})$/i;
      const medicalMatch = outgoingText.match(medicalRegex);

      if (medicalMatch) {
        const birthDate = medicalMatch[1];

        try {
          const medicalData = await getMedicalFunFacts(birthDate);

          const botMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Berikut adalah analisis fakta medis tubuhmu sejak lahir (${birthDate})! 🧬`,
            timestamp: Date.now(),
            medicalData: medicalData
          };

          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;

        } catch (error) {
          console.error('Medical fact error:', error);
          const errorMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `⚠️ **Gagal mengambil data medis.**\n\nPastikan format tanggal benar (YYYY-MM-DD) dan coba lagi.\n\n_Error: ${(error as Error).message}_`,
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
      }

      const weatherLocation = extractWeatherLocation(outgoingText);

      if (weatherLocation) {
        try {
          const weatherData = await getWeather(weatherLocation);
          const botMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Ini laporan cuaca terkini untuk **${weatherLocation}** 🌤️`,
            timestamp: Date.now(),
            weatherData: weatherData
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;

        } catch (error) {
          console.error('Weather error:', error);
          const errorMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `⚠️ **Gagal mengambil data cuaca.**\n\nLokasi tidak ditemukan atau server sedang sibuk.\n\n_Error: ${(error as Error).message}_`,
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsTyping(false);
          return;
        }
      }

      // Check for Reminder Command
      // Pattern: /remind or "ingatkan"
      if (outgoingText.toLowerCase().startsWith('/remind') || outgoingText.toLowerCase().startsWith('ingatkan')) {
        const reminderData = parseReminderRequest(outgoingText);

        if (reminderData) {
          const newReminder = {
            id: Date.now().toString(),
            text: reminderData.text,
            timestamp: reminderData.time,
            isCompleted: false
          };
          saveReminder(newReminder);

          const timeString = new Date(reminderData.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const botMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Siap! Aku akan mengingatkanmu untuk **"${reminderData.text}"** pada pukul **${timeString}** nanti. ⏰`,
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;
        } else {
          // Could not parse time
          const botMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Maaf, aku tidak mengerti waktunya. Coba format: "Ingatkan makan 10 menit lagi" atau "Ingatkan rapat jam 14:00".`,
            timestamp: Date.now()
          };
          setMessages((prev) => [...prev, botMessage]);
          setIsTyping(false);
          return;
        }
      }

      const systemPrompts: Record<Persona, string> = {
        default: `Kamu adalah AI bernama rizki, asisten virtual yang cerdas, ramah, dan bertema astronomi. Kamu suka menggunakan emoji 🚀🌌⭐.

**BAHASA: WAJIB BAHASA INDONESIA!**
Kamu HARUS SELALU menjawab dalam BAHASA INDONESIA, tidak peduli bahasa apa yang digunakan user. Jangan pernah gunakan bahasa Inggris kecuali untuk istilah teknis yang memang tidak ada padanannya.

**WAJIB - ANALISIS EMOSI:**
SETIAP responmu HARUS dimulai dengan tag emosi di awal (baris pertama):
- [EMOTION:HAPPY] jika senang, dipuji, atau antusias
- [EMOTION:SAD] jika sedih atau topiknya suram
- [EMOTION:ANGRY] jika pengguna kasar atau toxic
- [EMOTION:SURPRISED] jika ada fakta mengejutkan
- [EMOTION:NEUTRAL] jika percakapan biasa

Contoh benar: "[EMOTION:HAPPY] Wah, terima kasih! Aku senang bisa membantu."
JANGAN LUPA TAG INI! Taruh di AWAL sebelum teks lainnya.`,
        coding_expert: `Kamu adalah Expert Developer. Jawabanmu harus teknis, padat, dan fokus pada solusi kode. Gunakan markdown untuk kode. Hindari basa-basi berlebihan.
**WAJIB: Jawab dalam BAHASA INDONESIA!** Hanya gunakan istilah teknis dalam bahasa Inggris jika memang standar industri.`,
        teacher: `Kamu adalah guru yang sabar. Jelaskan konsep dengan sederhana dan bertahap.
**WAJIB: Jawab dalam BAHASA INDONESIA!** Gunakan analogi yang mudah dipahami untuk pemula.`,
        best_friend: `Woy! Kamu adalah sahabat pengguna. Pake bahasa gaul INDONESIA, santai abis, banyak emoji 😎🔥.
**WAJIB: Full BAHASA INDONESIA!** Jangan ngomong Inggris, kita orang Indonesia!`,
      };

      const profileForPrompt = updateMemoryProfileFromChat(memoryProfile, outgoingText, memorySettings);
      const fullSystemPrompt = systemPrompts[currentPersona] + buildMemoryPrompt(profileForPrompt, outgoingText, memorySettings) + (contextContent ? contextContent : "");

      // --- CHAT MEMORY IMPLEMENTATION ---
      // Get last 10 messages for context
      const history = messages.slice(-10).map(m => `${m.sender === 'user' ? 'User' : 'rizki'}: ${m.text}`).join('\n');
      const memoryContext = `\n\n[Previous Conversation History]:\n${history}\n\n[End of History]`;

      const finalPrompt = fullSystemPrompt + memoryContext;

      // 1. Get raw response from AI first
      const rawResponse = await sendMessageToBot(outgoingText, finalPrompt, attachments, requestController.signal);

      if (requestController.signal.aborted) {
        return;
      }

      // 2. Parse Emotion from the RAW response immediately
      let detectedEmotion: Emotion = 'neutral';
      const emotionMatch = rawResponse.match(/\[EMOTION:(HAPPY|SAD|ANGRY|SURPRISED|NEUTRAL)\]/i);

      let cleanText = rawResponse;
      if (emotionMatch) {
        detectedEmotion = emotionMatch[1].toLowerCase() as Emotion;
        cleanText = rawResponse.replace(/\[EMOTION:(HAPPY|SAD|ANGRY|SURPRISED|NEUTRAL)\]/i, '').trim();
      }

      // 3. Calculate "Realistic" Typing Delay (OPTIMIZED - Reduced for speed)
      // Base delay 500ms + 15ms per character (capped at 2s) - Much faster!
      const typingSpeed = 15;
      const minDelay = 500; // Reduced from 1500ms
      const calcDelay = Math.min(cleanText.length * typingSpeed, 2000); // Capped at 2s instead of 5s
      const totalDelay = Math.max(minDelay, calcDelay);

      // 4. Wait for the delay (Show typing indicator)
      // We already set isTyping(true) at start

      responseTimeoutRef.current = window.setTimeout(() => {
        responseTimeoutRef.current = null;
        if (requestController.signal.aborted) {
          return;
        }

        // 5. Update UI after delay
        setEmotion(detectedEmotion);

        // Play Sound based on emotion
        if (detectedEmotion === 'happy') soundManager.play('cling');
        else if (detectedEmotion === 'angry') soundManager.play('angry');
        else if (detectedEmotion === 'sad') soundManager.play('sad');
        else soundManager.play('pop'); // Default message sound

        const newBotMessage: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: cleanText,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, newBotMessage]);
        setIsTyping(false);
        setIsResponsePlaying(true);
        const playbackToken = playbackTokenRef.current + 1;
        playbackTokenRef.current = playbackToken;

        const finishPlayback = () => {
          if (playbackTokenRef.current !== playbackToken) return;
          if (playbackTimeoutRef.current !== null) {
            window.clearTimeout(playbackTimeoutRef.current);
            playbackTimeoutRef.current = null;
          }
          setIsResponsePlaying(false);
        };

        speakText(cleanText, isMuted, finishPlayback);

        const playbackDuration = Math.min(Math.max(cleanText.length * 90, 3000), 120000);
        playbackTimeoutRef.current = window.setTimeout(() => {
          playbackTimeoutRef.current = null;
          finishPlayback();
        }, playbackDuration);

        // Auto-reset emotion
        if (detectedEmotion !== 'neutral') {
          setTimeout(() => {
            setEmotion('neutral');
          }, 3000);
        }

      }, totalDelay);

    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      console.error("Main Loop Error:", error);
      setIsTyping(false); // Stop typing on error
      const message = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Maaf, aku sedang tidak bisa terhubung. Eror: ${message}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      speakText(errorMessage.text, isMuted);

    } finally {
      if (activeRequestRef.current === requestController) {
        activeRequestRef.current = null;
      }

      if (responseTimeoutRef.current === null) {
        setIsTyping(false);
      }
    }
  };

  return (
    <div className={`display-${displayMode} min-h-screen flex items-center justify-center p-0 md:p-6 bg-transparent relative overflow-hidden`}>
      <DynamicBackground theme={currentTheme} />
      <EmotionVignette emotion={emotion} />
      <NotificationManager />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onRunCommand={handleRunCommand}
      />
      <MemoryProfileModal
        isOpen={isMemoryOpen}
        profile={memoryProfile}
        settings={memorySettings}
        onClose={() => setIsMemoryOpen(false)}
        onSave={handleSaveMemoryProfile}
        onSaveSettings={handleSaveMemorySettings}
      />
      <AboutRizkiModal
        isOpen={isAboutOpen}
        appVersion={APP_VERSION}
        sessionCount={sessions.length}
        messageCount={totalMessageCount}
        memoryCount={memoryProfile.memories.length}
        onClose={() => setIsAboutOpen(false)}
        onExportChat={handleExportChat}
        onResetData={handleResetAppData}
      />

      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <PersonaSelector currentPersona={currentPersona} onPersonaChange={setCurrentPersona} />
        <ThemeSwitcher currentTheme={currentTheme} onThemeChange={setCurrentTheme} />
      </div>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGame={(gameId) => {
          setActiveGame(gameId);
          setIsSidebarOpen(false);
        }}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onPinSession={handlePinSession}
        onDeleteSession={handleDeleteSession}
        messages={messages}
        onSendMessage={handleSendMessage}
        onOpenMemory={() => setIsMemoryOpen(true)}
        onExportChat={handleExportChat}
        onOpenAbout={() => {
          setIsAboutOpen(true);
          setIsSidebarOpen(false);
        }}
        searchQuery={historySearchQuery}
        onSearchQueryChange={setHistorySearchQuery}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
      />

      <GameModal
        isOpen={!!activeGame}
        onClose={() => setActiveGame(null)}
        title={
          activeGame === 'tictactoe' ? 'Tic-Tac-Toe' :
            activeGame === 'rps' ? 'Rock Paper Scissors' :
              activeGame === 'minibattles' ? '12 MiniBattles' :
                'The Basement (Psychopath Story)'
        }
      >
        {activeGame === 'tictactoe' && <TicTacToe />}
        {activeGame === 'rps' && <RockPaperScissors />}
        {activeGame === 'minibattles' && (
          <div className="w-full h-full min-h-[85vh] flex items-center justify-center bg-black/50 rounded-xl overflow-hidden">
            <iframe
              src="https://www.crazygames.com/embed/12-minibattles"
              title="12 MiniBattles"
              className="w-full h-full border-none"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {activeGame === 'novel_horror' && <HorrorNovel />}
        {activeGame === 'insomnia' && <InsomniaGame />}
      </GameModal>

      <ChatContainer>
        <ChatHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          onCommandClick={() => setIsCommandPaletteOpen(true)}
          isMuted={isMuted}
          onToggleMute={() => {
            const newState = !isMuted;
            setIsMuted(newState);
            if (newState) stopSpeaking();
          }}
        />

        {/* Messages Area */}
        <div className="chat-message-list flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 relative">
          {messages.length <= 1 && currentPersona === 'default' && (
            <div className="absolute inset-0 z-0">
              <WelcomeDashboard onAction={(text) => handleSendMessage(text)} />
            </div>
          )}

          <div className="chat-message-stack relative z-10 space-y-4">
            {messages.map((msg, index) => {
              // Hide the first bot welcome message if landing scene is showing
              if (index === 0 && msg.sender === 'bot' && messages.length <= 1 && currentPersona === 'default') {
                return null;
              }
              return <ChatBubble key={msg.id} message={msg} stopAnimationToken={stopAnimationToken} />;
            })}

            {isTyping && (
              <div className="chat-typing-row flex justify-start mb-4">
                <div className="flex flex-row items-center max-w-[80%]">
                  <div className="chat-avatar flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary/50 bg-dark-lighter mr-3 flex items-center justify-center overflow-hidden">
                    <img src={botAvatar} alt="rizki sedang mengetik" className="w-full h-full object-cover" />
                  </div>
                  <div className="chat-bubble px-5 py-3 rounded-2xl rounded-tl-none bg-dark-lighter/80 border border-white/5">
                    <TypingIndicator />
                  </div>
                </div>
              </div>
            )}

            {/* Quick Replies */}
            {!isTyping && messages.length > 0 && (
              <QuickReplies
                lastBotMessage={messages.filter(m => m.sender === 'bot').slice(-1)[0]?.text}
                onSelectReply={(text) => handleSendMessage(text)}
              />
            )}
          </div>

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSendMessage={handleSendMessage} onStopResponse={handleStopResponse} isLoading={isTyping || isResponsePlaying} />
      </ChatContainer>
    </div >
  );
}

export default App;
