/** Tiny IndexedDB wrapper for Pencil/touch annotation strokes, keyed by note
 * route. Nothing in this repo used IndexedDB before this — localStorage
 * (used elsewhere for bookmarks/SRS/theme) is synchronous and capped at a
 * few MB, too small for freehand stroke data across hundreds of notes. */

const DB_NAME = 'learnex-annotations';
const DB_VERSION = 1;
const STORE_NAME = 'strokes';

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  points: StrokePoint[];
  color: string;
  width: number;
  // Optional because strokes saved before pencil/highlighter existed have no
  // tool recorded — callers should treat a missing value as 'pen'.
  tool?: 'pen' | 'pencil' | 'highlighter';
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME); // out-of-line key: the note route, passed to get/put directly
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Falls back to an empty stroke list (rather than throwing) if IndexedDB is
 * unavailable — private browsing, disabled storage, an old Safari quirk,
 * etc. Annotation is a nice-to-have layer, not something that should ever
 * break the underlying note page. */
export async function loadStrokes(route: string): Promise<Stroke[]> {
  try {
    const db = await openDb();
    return await new Promise<Stroke[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(route);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function saveStrokes(route: string, strokes: Stroke[]): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(strokes, route);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Best-effort persistence — see loadStrokes above.
  }
}
