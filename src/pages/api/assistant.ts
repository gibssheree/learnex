import type { APIRoute } from 'astro';
import { GoogleGenAI, FunctionCallingConfigMode, ThinkingLevel, type FunctionDeclaration } from '@google/genai';
import { searchVault } from '../../lib/rag';
import { DIAGRAM_INSTRUCTION, PERSONA_INSTRUCTIONS, isPersona, type Persona } from '../../lib/ai-personas';

// Server-rendered on demand (everything else in the site stays static) —
// this is the one route that needs a live request/response cycle to talk to
// Gemini. Requires the @astrojs/vercel adapter configured in astro.config.mjs.
export const prerender = false;

const CHAT_MODEL = 'gemini-3.6-flash';
const EMBEDDING_MODEL = 'gemini-embedding-2';
const MAX_TOOL_ROUNDS = 4;

const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY ?? '' });

const searchVaultDeclaration: FunctionDeclaration = {
  name: 'search_vault',
  description:
    "Searches Learnitas's knowledge vault (programming-language notes and CS/software-engineering term notes) for chunks of content relevant to a query. Call this whenever answering requires a specific fact, definition, or detail from the vault rather than general knowledge — don't guess vault-specific content.",
  parametersJsonSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'A focused search query describing what information is needed.' },
    },
    required: ['query'],
  },
};

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface CurrentPage {
  title: string;
  route: string;
}

async function embedQuery(text: string): Promise<number[]> {
  const res = await ai.models.embedContent({ model: EMBEDDING_MODEL, contents: text });
  const vector = res.embeddings?.[0]?.values;
  if (!vector) throw new Error('Gemini returned no embedding for the query.');
  return vector;
}

function systemInstruction(currentPage?: CurrentPage, persona: Persona = 'direct'): string {
  return [
    'You are the Learnitas Study Assistant, embedded in a personal programming/CS knowledge-vault site.',
    "Use the search_vault function whenever you need a specific fact, definition, or example from the vault — don't guess at vault-specific content.",
    'Keep answers study-focused. When you rely on a note, mention its title so the reader knows where it came from.',
    PERSONA_INSTRUCTIONS[persona],
    DIAGRAM_INSTRUCTION,
    currentPage ? `The user is currently reading: "${currentPage.title}" (${currentPage.route}).` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export const POST: APIRoute = async ({ request }) => {
  if (!import.meta.env.GEMINI_API_KEY) {
    return json({ error: 'GEMINI_API_KEY is not configured on the server.' }, 500);
  }

  let body: { messages?: ChatMessage[]; currentPage?: CurrentPage; persona?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) return json({ error: 'messages must be a non-empty array.' }, 400);
  const persona: Persona = isPersona(body.persona) ? body.persona : 'direct';

  // The Gemini `contents` array: a running list of role-tagged turns. User/
  // model text turns come straight from the client; function-call and
  // function-response turns get appended below as tool rounds resolve.
  // `as any` on the pushed tool turns: the SDK's exact `Content`/`Part`
  // type names are used loosely here since only the runtime JSON shape
  // (role + parts[].functionCall / functionResponse) is load-bearing for
  // the Gemini API protocol, not the TS type identity.
  const contents: unknown[] = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

  try {
    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await ai.models.generateContent({
        model: CHAT_MODEL,
        contents: contents as never,
        config: {
          systemInstruction: systemInstruction(body.currentPage, persona),
          tools: [{ functionDeclarations: [searchVaultDeclaration] }],
          toolConfig: { functionCallingConfig: { mode: FunctionCallingConfigMode.AUTO } },
          // Use minimal thinking for the RAG loop — these are focused
          // retrieval queries, not deep-reasoning tasks. MINIMAL keeps
          // latency low while satisfying Gemini 3.x's thinkingLevel
          // requirement (thinkingBudget is Gemini 2.x-only and triggers
          // INVALID_ARGUMENT on 3.x models).
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const call = response.functionCalls?.[0];
      if (!call) {
        return json({ text: response.text ?? "I couldn't find an answer to that." });
      }

      const query = typeof call.args?.query === 'string' ? call.args.query : '';
      const results = query
        ? searchVault(await embedQuery(query), 5).map((r) => ({
            title: r.title,
            route: r.route,
            heading: r.heading,
            excerpt: r.text.slice(0, 600),
          }))
        : [];

      // IMPORTANT: push the full verbatim model Content object (not a
      // reconstructed one). Gemini 3.x thinking models embed a signed
      // `thought` part alongside `functionCall` — if we reconstruct the
      // content manually we lose the thought_signature and the next API
      // call returns 400 INVALID_ARGUMENT.
      const modelContent = response.candidates?.[0]?.content;
      if (modelContent) {
        contents.push(modelContent);
      } else {
        contents.push({ role: 'model', parts: [{ functionCall: call }] });
      }
      contents.push({ role: 'user', parts: [{ functionResponse: { name: call.name, response: { results } } }] });
    }

    return json({ text: "I looked but couldn't pin down a good answer — try rephrasing your question?" });
  } catch (err) {
    console.error('[api/assistant]', err);
    return json({ error: 'The Study Assistant hit an error talking to Gemini. Check server logs.' }, 502);
  }
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
