/** A deliberately small SM-2-flavored spaced-repetition scheduler. Not a full
 * SuperMemo implementation — just enough to make review order meaningful. */

import { supabase } from './supabase-client';
import { getCurrentUserId } from './auth-client';

export interface CardState {
  route: string;
  interval: number; // days
  ease: number;
  due: string; // ISO date, yyyy-mm-dd
  reps: number;
}

export type Grade = 'again' | 'hard' | 'good' | 'easy';

const KEY = 'learnitas-srs';

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
  document.dispatchEvent(new CustomEvent('learnitas:srs-changed'));
  pushState(state);
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

// ── Cross-device sync (logged-in users only) ────────────────────────────────
// Guests (getCurrentUserId() === null) hit a no-op here — byte-identical
// behavior to before sync existed. user_id is never sent from the client on
// writes; the schema's `default auth.uid()` supplies it, resolved by
// Postgres before the upsert's onConflict target is checked.

function pushState(state: CardState) {
  const userId = getCurrentUserId();
  if (!userId) return;
  supabase
    .from('srs_cards')
    .upsert(
      { route: state.route, interval: state.interval, ease: state.ease, due: state.due, reps: state.reps },
      { onConflict: 'user_id,route' },
    )
    .then(({ error }) => {
      if (error) console.error('[srs] sync upsert failed', error);
    });
}

async function pullAndReplace(userId: string) {
  const { data, error } = await supabase.from('srs_cards').select('route,interval,ease,due,reps').eq('user_id', userId);
  if (error || !data) {
    console.error('[srs] pull failed', error);
    return;
  }
  const states: Record<string, CardState> = {};
  for (const row of data) states[row.route] = row as CardState;
  localStorage.setItem(KEY, JSON.stringify(states));
  document.dispatchEvent(new CustomEvent('learnitas:srs-changed'));
}

/** Runs once, at the moment of an interactive sign-in — unlike
 * pullAndReplace (server wins, used on ordinary page loads), this unions
 * server + local state so a first-time login never silently discards
 * review progress collected while browsing as a guest. Local wins on
 * conflict (it's the freshest thing that just happened in-browser). */
async function mergeOnSignIn(userId: string) {
  const local = loadStates();
  const { data, error } = await supabase.from('srs_cards').select('route,interval,ease,due,reps').eq('user_id', userId);
  if (error) {
    console.error('[srs] merge pull failed', error);
    return;
  }
  const merged: Record<string, CardState> = {};
  for (const row of data ?? []) merged[row.route] = row as CardState;
  for (const route of Object.keys(local)) merged[route] = local[route];
  const rows = Object.values(merged);
  if (rows.length) {
    const { error: upsertError } = await supabase
      .from('srs_cards')
      .upsert(
        rows.map((s) => ({ route: s.route, interval: s.interval, ease: s.ease, due: s.due, reps: s.reps })),
        { onConflict: 'user_id,route' },
      );
    if (upsertError) console.error('[srs] merge push failed', upsertError);
  }
  localStorage.setItem(KEY, JSON.stringify(merged));
  document.dispatchEvent(new CustomEvent('learnitas:srs-changed'));
}

document.addEventListener('learnitas:auth-changed', (e) => {
  const detail = (e as CustomEvent).detail as { userId: string | null; event: string } | undefined;
  if (!detail?.userId) return; // signed out — leave localStorage exactly as-is
  if (detail.event === 'SIGNED_IN') mergeOnSignIn(detail.userId);
  else pullAndReplace(detail.userId); // INITIAL_SESSION / TOKEN_REFRESHED — server wins
});
