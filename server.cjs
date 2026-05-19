const express = require('express');
const cors = require('cors');
const CharacterAI = require('node_characterai');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    for (const line of envFile.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

        const [key, ...valueParts] = trimmed.split('=');
        if (!process.env[key]) {
            process.env[key] = valueParts.join('=').trim();
        }
    }
}

app.use(cors());
app.use(express.json({ limit: '12mb' }));

const characterAI = new CharacterAI();

// Store active chats in memory (simple implementation)
// Map<string, any>
const chats = new Map();

// Configuration - REPLACE THESE WITH YOUR VALUES
// You can also use specific environment variables
const CHARACTER_ID = process.env.CHARACTER_ID || "UvmcFYHfT11SuZvgxiY2sxktiDozY2rh4wsMS10TPGI"; // Default: Programmer Psychologist
const SESSION_TOKEN = process.env.SESSION_TOKEN || ""; // Put your CAI session token here
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
const OPENROUTER_VISION_MODEL = process.env.OPENROUTER_VISION_MODEL || "google/gemini-2.5-flash-lite";

// Initialize AI
async function initAI() {
    try {
        if (SESSION_TOKEN) {
            console.log("Authenticating with session token...");
            await characterAI.authenticateWithToken(SESSION_TOKEN);
        } else {
            console.log("Authenticating as guest...");
            await characterAI.authenticateAsGuest();
        }
        console.log("Character.AI authenticated successfully");
    } catch (error) {
        console.error("Failed to authenticate Character.AI:", error);
    }
}

const voiceCache = new Map(); // Cache voice IDs

async function sendOpenRouterMessage(message, systemPrompt = "", attachments = []) {
    if (!OPENROUTER_API_KEY) {
        const error = new Error("OpenRouter API key belum diatur.");
        error.statusCode = 500;
        throw error;
    }

    if (!message || typeof message !== 'string') {
        const error = new Error("Pesan tidak boleh kosong.");
        error.statusCode = 400;
        throw error;
    }

    const messages = [];
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
    }
    const imageAttachments = Array.isArray(attachments)
        ? attachments.filter((item) => item?.type === 'image' && typeof item.dataUrl === 'string')
        : [];
    const hasImages = imageAttachments.length > 0;
    const model = hasImages ? OPENROUTER_VISION_MODEL : OPENROUTER_MODEL;

    if (imageAttachments.length > 0) {
        messages.push({
            role: 'user',
            content: [
                { type: 'text', text: message },
                ...imageAttachments.map((item) => ({
                    type: 'image_url',
                    image_url: { url: item.dataUrl }
                }))
            ]
        });
    } else {
        messages.push({ role: 'user', content: message });
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'rizki'
        },
        body: JSON.stringify({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1200
        })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error?.message || data.message || response.statusText);
        error.statusCode = response.status;
        throw error;
    }

    const text = data.choices?.[0]?.message?.content;
    if (!text) {
        const error = new Error("Respons OpenRouter kosong.");
        error.statusCode = 502;
        throw error;
    }

    return text;
}

app.post('/api/tts', async (req, res) => {
    try {
        const { text, characterId = CHARACTER_ID } = req.body;
        console.log(`TTS Request for: ${characterId}`);

        if (!characterAI.isAuthenticated()) {
            await initAI();
        }

        // 1. Get Voice ID (Cache it to avoid repeated fetches)
        let voiceId = voiceCache.get(characterId);

        if (!voiceId) {
            console.log("Fetching character info for voice ID...");
            const charInfo = await characterAI.fetchCharacterInfo(characterId);
            // Try different possible properties for voice ID
            voiceId = charInfo.voiceId || charInfo.voice_uuid || "";

            if (!voiceId) {
                console.warn("No voice ID found for this character. Trying default search...");
                // Fallback or error? For now, let's error if no voice.
                // Or maybe the library handles null voiceId as default?
            } else {
                voiceCache.set(characterId, voiceId);
                console.log(`Found Voice ID: ${voiceId}`);
            }
        }

        // 2. Fetch TTS
        // The library returns a ReadableStream or buffer? 
        // Based on docs/common usage, fetchTTS returns a URL or buffer.
        // Let's assume the library's fetchTTS returns the audio buffer directly or a path.
        // Actually, node_characterai fetchTTS returns: Promise<Buffer> usually.

        if (!voiceId) {
            return res.status(400).json({ error: "Character has no voice assigned." });
        }

        const audioPathOrBuffer = await characterAI.fetchTTS(voiceId, text);

        // If it returns a buffer, send it.
        // If it returns a path (some versions save file), we need to read it.
        // Let's assume buffer for now as it's cleaner.

        res.set('Content-Type', 'audio/mpeg');
        res.send(audioPathOrBuffer);

    } catch (error) {
        console.error("TTS Error:", error);
        res.status(500).json({ error: "TTS Failed", details: error.message });
    }
});

app.post('/api/openrouter', async (req, res) => {
    try {
        const { message, systemPrompt = "", attachments = [] } = req.body;
        const text = await sendOpenRouterMessage(message, systemPrompt, attachments);
        res.json({ text });
    } catch (error) {
        console.error("OpenRouter Error:", error);
        res.status(error.statusCode || 500).json({ error: "Gagal terhubung ke OpenRouter", details: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, systemPrompt = "", attachments = [] } = req.body;
        const text = await sendOpenRouterMessage(message, systemPrompt, attachments);
        res.json({
            text,
        });

    } catch (error) {
        console.error("Error in chat endpoint:", error);
        res.status(error.statusCode || 500).json({ error: "Failed to communicate with rizki", details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Environment: Node ${process.version}`);
});
