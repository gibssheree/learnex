/** Shared between the server (api/assistant.ts, Node runtime) and the client
 * (StudyAssistant.astro's script, browser runtime — including the local-model
 * path that never touches the server) so both backends give the same persona
 * behavior and the same lightweight diagram instruction, instead of two
 * copies of prompt text drifting apart. */

export type Persona = 'direct' | 'socratic' | 'encouraging';

export const PERSONA_LABELS: Record<Persona, string> = {
  direct: 'Direct',
  socratic: 'Socratic',
  encouraging: 'Encouraging',
};

export const PERSONA_INSTRUCTIONS: Record<Persona, string> = {
  direct:
    'Persona: Direct. Answer with facts, definitions, and code straight away — no follow-up questions, no preamble, no fluff.',
  socratic:
    "Persona: Socratic. Prefer guiding questions over handing over the final answer outright — help the reader reason toward it themselves, then confirm or correct once they attempt it. Give the answer directly only if they ask you to stop quizzing them.",
  encouraging:
    'Persona: Encouraging Guide. Explain gently and simply (ELI5 where it helps), break concepts into small steps, and add brief positive reinforcement. Assume the reader is a beginner and avoid unexplained jargon.',
};

export function isPersona(value: unknown): value is Persona {
  return value === 'direct' || value === 'socratic' || value === 'encouraging';
}

// Learnitas's own tiny diagram format — NOT real Mermaid syntax. A hand-rolled
// node/edge JSON block that src/lib/diagram.ts lays out and renders as
// inline SVG (see that file for why: this repo has zero client charting
// dependencies, and a personal-vault-scale "visualize this" feature doesn't
// need one). The instruction says so explicitly so the model doesn't emit
// real Mermaid grammar we can't parse.
export const DIAGRAM_INSTRUCTION =
  'If the user explicitly asks you to visualize, diagram, or sketch something, reply with a fenced ```learnitas-diagram code block containing JSON of the shape {"nodes":[{"id":"a","label":"..."}],"edges":[{"from":"a","to":"b","label":"optional"}]} (max ~10 nodes) instead of only describing it in prose — keep any surrounding text brief. This is Learnitas\'s own lightweight diagram format, not real Mermaid syntax, so do not use Mermaid grammar inside it.';
