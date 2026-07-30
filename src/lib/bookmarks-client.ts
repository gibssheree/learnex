const KEY = 'learnex-bookmarks';

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
  document.dispatchEvent(new CustomEvent('learnex:bookmarks-changed'));
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
    return false;
  }
  list.unshift(bookmark);
  save(list);
  return true;
}

export function removeBookmark(url: string) {
  save(getBookmarks().filter((b) => b.url !== url));
}
