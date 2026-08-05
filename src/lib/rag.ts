import vaultEmbeddings from '../data/vault-embeddings.json';

export interface VaultChunk {
  route: string;
  title: string;
  domain: string;
  heading: string;
  text: string;
  vector: number[];
}

export interface SearchResult {
  title: string;
  route: string;
  heading: string;
  text: string;
  score: number;
}

// Cast once at module scope rather than at every call site — the JSON import
// is empty ([]) until `npm run build-embeddings` has been run with a real
// GEMINI_API_KEY (see scripts/build-embeddings.mjs), so searchVault() below
// just returns no results until then, rather than throwing.
const chunks = vaultEmbeddings as VaultChunk[];

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/** Brute-force cosine-similarity search over the build-time embeddings index.
 * At this vault's size (a few thousand chunks) this is sub-100ms in plain
 * JS — a vector database would be premature infrastructure here. */
export function searchVault(queryVector: number[], topK = 5): SearchResult[] {
  return chunks
    .map((c) => ({
      title: c.title,
      route: c.route,
      heading: c.heading,
      text: c.text,
      score: cosineSimilarity(queryVector, c.vector),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
