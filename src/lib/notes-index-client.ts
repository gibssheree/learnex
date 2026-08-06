export interface NoteIndexEntry {
  title: string;
  url: string;
}

let notesIndexPromise: Promise<NoteIndexEntry[]> | null = null;

/** Lazily fetches and memoizes /random-index.json — the flat title+route list
 * shared by the header's "random note" button and the command palette's note
 * search. Vite dedupes this module across every importer, so the fetch only
 * ever fires once per page load no matter how many components ask for it. */
export function getNotesIndex(): Promise<NoteIndexEntry[]> {
  if (!notesIndexPromise) {
    notesIndexPromise = fetch('/random-index.json')
      .then((r) => r.json())
      .catch(() => []);
  }
  return notesIndexPromise;
}
