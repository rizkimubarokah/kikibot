# rizki

rizki adalah aplikasi asisten virtual berbasis React, TypeScript, dan Vite.
Chat utama rizki memakai OpenRouter lewat server lokal agar API key tidak masuk ke bundle browser.

## Menjalankan

```bash
npm install
npm run dev
```

Simpan konfigurasi di `.env`:

```bash
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY_HERE
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_VISION_MODEL=google/gemini-2.5-flash-lite
```

## Build

```bash
npm run build
```
