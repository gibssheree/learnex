import type { APIRoute } from 'astro';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { createSupabaseServerClient } from '../../lib/supabase-server';

// Server-rendered on demand, same reason as api/assistant.ts — this route
// talks to Gemini live. A separate route from api/assistant.ts rather than
// reusing its RAG loop: combining a custom functionDeclarations tool with
// googleSearch grounding in one generateContent call is a known source of
// INVALID_ARGUMENT errors on some Gemini API versions, and this feature
// doesn't need vault RAG in the same turn anyway.
export const prerender = false;

const SEARCH_MODEL = 'gemini-3.6-flash';

const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY ?? '' });

interface RequestBody {
  query?: string;
  summary?: string;
}

interface Source {
  title: string;
  url: string;
  summary: string;
}

interface ReferencesResult {
  answer: string;
  sources: Source[];
  searchQueries: string[];
  searchSuggestionsHtml: string | null;
}

const SOURCE_LINE_RE = /^SOURCE:\s*(.+?)\s*::\s*(.+)$/i;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const SYSTEM_INSTRUCTION = [
  "You are Learnitas's research assistant. Search the web for current, reliable sources about the given " +
    'topic (encyclopedic/reference sites like Wikipedia and Investopedia are ideal) and produce a compact, ' +
    'well-cited briefing.',
  'Respond in EXACTLY this format:',
  '1. A short synthesized answer (2-4 sentences), in your own words.',
  '2. A blank line.',
  '3. One line per source you actually used, each in exactly this form: SOURCE: <source title exactly as ' +
    'shown in your search results> :: <one sentence paraphrasing that specific source, in your own words, not ' +
    'a quote>',
  'List 5 to 10 sources. No markdown formatting inside the SOURCE lines. No extra sections.',
].join('\n');

export const POST: APIRoute = async ({ request, cookies }) => {
  // Same cost-control gate as api/assistant.ts: check auth before spending
  // anything on Gemini, not after.
  const supabase = createSupabaseServerClient(request, cookies);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return json({ error: 'Log in to use web references.' }, 401);
  }

  if (!import.meta.env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const query = (body.query ?? '').trim();
  if (!query) return json({ error: 'query is required.' }, 400);

  const userText = body.summary ? `${query}\n\nContext: ${body.summary}` : query;

  try {
    const response = await ai.models.generateContent({
      model: SEARCH_MODEL,
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // Minimal thinking: this is a focused search-and-summarize task, not
        // deep reasoning. Required (not optional) on Gemini 3.x models — see
        // the identical comment in api/assistant.ts.
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
      },
    });

    const text = response.text ?? '';
    const grounding = response.candidates?.[0]?.groundingMetadata;
    const chunks = grounding?.groundingChunks ?? [];

    const narrativeLines: string[] = [];
    const parsed: { title: string; summary: string }[] = [];
    for (const line of text.split('\n')) {
      const m = line.match(SOURCE_LINE_RE);
      if (m) parsed.push({ title: m[1].trim(), summary: m[2].trim() });
      else narrativeLines.push(line);
    }

    // Fuzzy-match parsed titles against the real grounding chunks to recover
    // URLs — deliberately not parsing groundingSupports' citation-span
    // offsets, which would be far more fragile for the same result. If a
    // source's title never shows up in a SOURCE: line (model didn't follow
    // the format for it), it still renders with title+url and an empty
    // summary rather than being dropped.
    const sources: Source[] = chunks
      .map((c) => {
        const web = c.web;
        if (!web?.uri) return null;
        const norm = normalize(web.title ?? '');
        const match = parsed.find((p) => normalize(p.title).includes(norm) || norm.includes(normalize(p.title)));
        return { title: web.title ?? web.uri, url: web.uri, summary: match?.summary ?? '' };
      })
      .filter((s): s is Source => !!s);

    const result: ReferencesResult = {
      answer: narrativeLines.join('\n').trim(),
      sources,
      searchQueries: grounding?.webSearchQueries ?? [],
      searchSuggestionsHtml: grounding?.searchEntryPoint?.renderedContent ?? null,
    };
    return json(result);
  } catch (err) {
    console.error('[api/references]', err);
    return json({ error: 'Web references hit an error talking to Gemini. Check server logs.' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
