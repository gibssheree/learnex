import type { APIRoute } from 'astro';
import { GoogleGenAI, Modality } from '@google/genai';

// Server-rendered on demand, same reasoning as api/assistant.ts.
export const prerender = false;

const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const VOICE_NAME = 'Kore';
const MAX_CHARS = 2000;
const DEFAULT_SAMPLE_RATE = 24000;

const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY ?? '' });

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
  }

  let body: { text?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const text = (body.text ?? '').trim().slice(0, MAX_CHARS);
  if (!text) return json({ error: 'text must be a non-empty string.' }, 400);

  try {
    const response = await ai.models.generateContent({
      model: TTS_MODEL,
      contents: [{ role: 'user', parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } } },
      },
    });

    const inline = response.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inline?.data) {
      return json({ error: 'Gemini returned no audio for that text.' }, 502);
    }

    // Gemini's TTS models return raw 16-bit PCM (no container), so it can't
    // be handed to <audio> as-is — wrap it in a WAV header server-side.
    const sampleRate = sampleRateFromMimeType(inline.mimeType) ?? DEFAULT_SAMPLE_RATE;
    const audioBase64 = pcmToWavBase64(inline.data, sampleRate);
    return json({ audioBase64, mimeType: 'audio/wav' });
  } catch (err) {
    console.error('[api/speak]', err);
    return json({ error: 'The Study Assistant hit an error synthesizing speech. Check server logs.' }, 502);
  }
};

function sampleRateFromMimeType(mimeType?: string): number | undefined {
  const match = mimeType?.match(/rate=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

function pcmToWavBase64(pcmBase64: string, sampleRate: number, channels = 1, bitDepth = 16): string {
  const pcm = Buffer.from(pcmBase64, 'base64');
  const byteRate = (sampleRate * channels * bitDepth) / 8;
  const blockAlign = (channels * bitDepth) / 8;

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitDepth, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]).toString('base64');
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
