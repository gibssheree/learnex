import { supabase } from './supabase-client';
import { getCurrentUserId } from './auth-client';

const KEY = 'learnitas-bookmarks';

export interface Bookmark {
  title: string;
  url: string;
}

export function getBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list: Bookmark[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  document.dispatchEvent(new CustomEvent('learnitas:bookmarks-changed'));
}

export function isBookmarked(url: string): boolean {
  return getBookmarks().some((b) => b.url === url);
}

/** Returns the new bookmarked state (true = now saved, false = now removed). */
export function toggleBookmark(bookmark: Bookmark): boolean {
  const list = getBookmarks();
  const idx = list.findIndex((b) => b.url === bookmark.url);
  if (idx >= 0) {
    list.splice(idx, 1);
    save(list);
    pushRemove(bookmark.url);
    return false;
  }
  list.unshift(bookmark);
  save(list);
  pushUpsert(bookmark);
  return true;
}

export function removeBookmark(url: string) {
  save(getBookmarks().filter((b) => b.url !== url));
  pushRemove(url);
}

// ── Cross-device sync (logged-in users only) ────────────────────────────────
// Guests (getCurrentUserId() === null) hit a no-op here — byte-identical
// behavior to before sync existed. user_id is never sent from the client on
// writes; the schema's `default auth.uid()` supplies it, resolved by
// Postgres before the upsert's onConflict target is checked.

function pushUpsert(bookmark: Bookmark) {
  const userId = getCurrentUserId();
  if (!userId) return;
  supabase
    .from('bookmarks')
    .upsert({ url: bookmark.url, title: bookmark.title }, { onConflict: 'user_id,url' })
    .then(({ error }) => {
      if (error) console.error('[bookmarks] sync upsert failed', error);
    });
}

function pushRemove(url: string) {
  const userId = getCurrentUserId();
  if (!userId) return;
  supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('url', url)
    .then(({ error }) => {
      if (error) console.error('[bookmarks] sync delete failed', error);
    });
}

async function pullAndReplace(userId: string) {
  const { data, error } = await supabase.from('bookmarks').select('url,title').eq('user_id', userId);
  if (error || !data) {
    console.error('[bookmarks] pull failed', error);
    return;
  }
  save(data as Bookmark[]);
}

/** Runs once, at the moment of an interactive sign-in — unlike
 * pullAndReplace (server wins, used on ordinary page loads), this unions
 * server + local state so a first-time login never silently discards
 * bookmarks collected while browsing as a guest. Local wins on conflict
 * (it's the freshest thing that just happened in-browser). */
async function mergeOnSignIn(userId: string) {
  const local = getBookmarks();
  const { data, error } = await supabase.from('bookmarks').select('url,title').eq('user_id', userId);
  if (error) {
    console.error('[bookmarks] merge pull failed', error);
    return;
  }
  const byUrl = new Map<string, Bookmark>((data ?? []).map((b) => [b.url, b as Bookmark]));
  for (const b of local) byUrl.set(b.url, b);
  const merged = [...byUrl.values()];
  if (merged.length) {
    const { error: upsertError } = await supabase
      .from('bookmarks')
      .upsert(
        merged.map((b) => ({ url: b.url, title: b.title })),
        { onConflict: 'user_id,url' },
      );
    if (upsertError) console.error('[bookmarks] merge push failed', upsertError);
  }
  save(merged);
}

document.addEventListener('learnitas:auth-changed', (e) => {
  const detail = (e as CustomEvent).detail as { userId: string | null; event: string } | undefined;
  if (!detail?.userId) return; // signed out — leave localStorage exactly as-is
  if (detail.event === 'SIGNED_IN') mergeOnSignIn(detail.userId);
  else pullAndReplace(detail.userId); // INITIAL_SESSION / TOKEN_REFRESHED — server wins
});
