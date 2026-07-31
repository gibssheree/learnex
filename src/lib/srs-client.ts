/** A deliberately small SM-2-flavored spaced-repetition scheduler. Not a full
 * SuperMemo implementation — just enough to make review order meaningful. */

export interface CardState {
  route: string;
  interval: number; // days
  ease: number;
  due: string; // ISO date, yyyy-mm-dd
  reps: number;
}

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const KEY = 'learnex-srs';

export function loadStates(): Record<string, CardState> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function saveState(states: Record<string, CardState>, state: CardState) {
  states[state.route] = state;
  localStorage.setItem(KEY, JSON.stringify(states));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + Math.round(days));
  return d.toISOString().slice(0, 10);
}

export function isDue(state: CardState | undefined): boolean {
  if (!state) return true;
  return state.due <= todayISO();
}

/** Count of cards with an existing review history that are due right now —
 * deliberately excludes never-reviewed notes, since those aren't "waiting"
 * for anyone, just available. Used for the small due-count badge on the
 * header's review button, so the SRS queue isn't only visible on /review
 * itself. */
export function getDueCount(): number {
  return Object.values(loadStates()).filter(isDue).length;
}

export function grade(state: CardState | undefined, route: string, g: Grade): CardState {
  let { interval, ease, reps } = state ?? { interval: 0, ease: 2.5, reps: 0, route, due: todayISO() };

  if (g === 'again') {
    reps = 0;
    interval = 0;
    ease = Math.max(1.3, ease - 0.2);
  } else if (g === 'hard') {
    interval = Math.max(1, interval * 1.2 || 1);
    ease = Math.max(1.3, ease - 0.15);
    reps += 1;
  } else if (g === 'good') {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  } else {
    interval = reps === 0 ? 4 : Math.round(interval * ease * 1.3);
    ease = Math.min(3.2, ease + 0.15);
    reps += 1;
  }

  return { route, interval, ease, due: addDays(interval), reps };
}
