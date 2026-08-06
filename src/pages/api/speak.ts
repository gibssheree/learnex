import type { APIRoute } from 'astro';

// Server-rendered on demand — same reasoning as api/assistant.ts.
export const prerender = false;

// Google Cloud Text-to-Speech REST endpoint.
// Requires a Cloud API key (not the same as the AI Studio GEMINI_API_KEY) with
// the Cloud Text-to-Speech API enabled on the project:
//   console.cloud.google.com → APIs & Services → Enable → Cloud Text-to-Speech API
//   Then create an API key under APIs & Services → Credentials.
// Set GOOGLE_TTS_API_KEY in your .env (and Vercel project env vars).
const TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

// en-US-Neural2-D — clear, professional male voice (Neural2 tier).
// Other good male options:
//   en-US-Neural2-A  — warm male
//   en-US-Neural2-J  — younger male
//   en-US-Wavenet-D  — slightly lower cost, still natural
const VOICE_NAME    = 'en-US-Neural2-D';
const LANGUAGE_CODE = 'en-US';
const MAX_CHARS     = 2000;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.GOOGLE_TTS_API_KEY ?? '';
  if (!apiKey) {
    return json(
      { error: 'GOOGLE_TTS_API_KEY is not configured. See api/speak.ts for setup instructions.' },
      500,
    );
  }

  let body: { text?: string };
  try { body = await request.json(); }
  catch { return json({ error: 'Invalid JSON body.' }, 400); }

  const text = (body.text ?? '').trim().slice(0, MAX_CHARS);
  if (!text) return json({ error: 'text must be a non-empty string.' }, 400);

  try {
    const res = await fetch(`${TTS_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: LANGUAGE_CODE,
          name: VOICE_NAME,
          ssmlGender: 'MALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,  // 0.25–4.0, 1.0 = natural pace
          pitch: 0.0,         // -20.0–20.0 semitones, 0 = default
          volumeGainDb: 0.0,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.audioContent) {
      console.error('[api/speak] Google TTS error:', data);
      return json(
        { error: data.error?.message ?? 'Google TTS request failed.' },
        502,
      );
    }

    // Google Cloud TTS returns base64-encoded MP3 in `audioContent` —
    // no manual WAV header construction needed, unlike Gemini TTS PCM output.
    return json({ audioBase64: data.audioContent, mimeType: 'audio/mp3' });
  } catch (err) {
    console.error('[api/speak]', err);
    return json({ error: 'Speech synthesis failed. Check server logs.' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
