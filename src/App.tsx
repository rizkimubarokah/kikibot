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
import botAvatar from './assets/avatar.png';
import WelcomeDashboard from './components/WelcomeDashboard';
import { sendMessageToBot } from './services/customApi';
import { fetchMediaData } from './services/mediaDownloader';
import { generateImage } from './services/imageGenerator';
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
    return [{
      id: 1,
      sender: 'bot',
      text: "Halo! Aku rizki, asisten virtualmu. Ada yang bisa aku bantu hari ini? 🚀🌌",
      timestamp: Date.now(),
    }];
  });
  const [isTyping, setIsTyping] = useState(false);
  const [emotion, setEmotion] = useState<Emotion>('neutral');
  const [currentTheme, setCurrentTheme] = useState<Theme>('auto');
  const [currentPersona, setCurrentPersona] = useState<Persona>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    const initialMessage: Message = {
      id: Date.now(),
      sender: 'bot',
      text: "Halo! Aku rizki, asisten virtualmu. Ada yang bisa aku bantu hari ini? 🚀🌌",
      timestamp: Date.now(),
    };

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
          const initialMessage: Message = {
            id: Date.now(),
            sender: 'bot',
            text: "Halo! Aku rizki, asisten virtualmu. Ada yang bisa aku bantu hari ini? 🚀🌌",
            timestamp: Date.now(),
          };
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

  const handleSendMessage = async (text: string, file?: File) => {
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
    setIsTyping(true);

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

            // Strictly limit context to avoid URL length issues (max ~400 chars for file context)
            const truncatedText = cleanText.length > 400 ? cleanText.substring(0, 400) + "...[Truncated due to length]" : cleanText;

            contextContent = ` [File Context: ${truncatedText}]`;
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
      const imageRegex = /^(?:\/image|buatkan gambar)\s+(.+)$/i;
      const imageMatch = outgoingText.match(imageRegex);

      if (imageMatch) {
        const prompt = imageMatch[1];
        const imageUrl = generateImage(prompt);

        const botMessage: Message = {
          id: Date.now() + 1,
          sender: 'bot',
          text: `Berikut adalah gambar untuk: **${prompt}**`,
          timestamp: Date.now(),
          imageUrl: imageUrl
        };

        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
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

      // Check for Weather Command
      // Pattern: /weather City or cek cuaca City
      const weatherRegex = /^(?:\/weather|cek cuaca|info cuaca)\s+(.+)$/i;
      const weatherMatch = outgoingText.match(weatherRegex);

      if (weatherMatch) {
        const location = weatherMatch[1];
        try {
          const weatherData = await getWeather(location);
          const botMessage: Message = {
            id: Date.now() + 1,
            sender: 'bot',
            text: `Ini laporan cuaca terkini untuk **${location}** 🌤️`,
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

      const fullSystemPrompt = systemPrompts[currentPersona] + (contextContent ? contextContent : "");

      // --- CHAT MEMORY IMPLEMENTATION ---
      // Get last 10 messages for context
      const history = messages.slice(-10).map(m => `${m.sender === 'user' ? 'User' : 'rizki'}: ${m.text}`).join('\n');
      const memoryContext = `\n\n[Previous Conversation History]:\n${history}\n\n[End of History]`;

      const finalPrompt = fullSystemPrompt + memoryContext;

      // 1. Get raw response from AI first
      let rawResponse = await sendMessageToBot(outgoingText, finalPrompt, attachments);

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

      setTimeout(() => {
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
        speakText(cleanText, isMuted);

        // Auto-reset emotion
        if (detectedEmotion !== 'neutral') {
          setTimeout(() => {
            setEmotion('neutral');
          }, 3000);
        }

      }, totalDelay);

    } catch (error: any) {
      console.error("Main Loop Error:", error);
      setIsTyping(false); // Stop typing on error
      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: 'bot',
        text: `Maaf, aku sedang tidak bisa terhubung. Eror: ${error.message || 'Unknown error'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      speakText(errorMessage.text, isMuted);

    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-6 bg-transparent relative overflow-hidden">
      <DynamicBackground theme={currentTheme} />
      <EmotionVignette emotion={emotion} />
      <NotificationManager />

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
          isMuted={isMuted}
          onToggleMute={() => {
            const newState = !isMuted;
            setIsMuted(newState);
            if (newState) stopSpeaking();
          }}
        />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 relative">
          {messages.length <= 1 && currentPersona === 'default' && (
            <div className="absolute inset-0 z-0">
              <WelcomeDashboard />
            </div>
          )}

          <div className="relative z-10 space-y-4">
            {messages.map((msg, index) => {
              // Hide the first bot welcome message if landing scene is showing
              if (index === 0 && msg.sender === 'bot' && messages.length <= 1 && currentPersona === 'default') {
                return null;
              }
              return <ChatBubble key={msg.id} message={msg} />;
            })}

            {isTyping && (
              <div className="flex justify-start mb-4">
                <div className="flex flex-row items-center max-w-[80%]">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border-2 border-primary/50 bg-dark-lighter mr-3 flex items-center justify-center overflow-hidden">
                    <img src={botAvatar} alt="rizki sedang mengetik" className="w-full h-full object-cover" />
                  </div>
                  <div className="px-5 py-3 rounded-2xl rounded-tl-none bg-dark-lighter/80 border border-white/5">
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

        <ChatInput onSendMessage={handleSendMessage} isLoading={isTyping} />
      </ChatContainer>
    </div >
  );
}

export default App;
