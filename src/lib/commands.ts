/** Static action list for the command palette (CommandPalette.astro). Kept
 * separate from the component so adding a new command is a one-line append
 * here rather than touching palette rendering/filtering logic. Every run()
 * clicks an existing button or dispatches an existing custom event rather
 * than reimplementing toggle logic that already lives in Header.astro /
 * StudyCanvas.astro — this list is a remote control, not a second brain. */

export type CommandSection = 'Navigasi' | 'Tampilan' | 'Aksi';

export interface Command {
  id: string;
  label: string;
  /** Extra terms matched against but not displayed (e.g. English synonyms). */
  keywords?: string;
  section: CommandSection;
  /** Return false to hide this command on pages where it wouldn't do
   * anything (e.g. Study Canvas actions on pages with no canvas mounted). */
  available?: () => boolean;
  run: () => void;
}

function clickById(id: string) {
  (document.getElementById(id) as HTMLElement | null)?.click();
}

export const STATIC_COMMANDS: Command[] = [
  { id: 'open-languages', label: 'Buka Programming Languages', section: 'Navigasi', run: () => { window.location.href = '/languages'; } },
  { id: 'open-terms', label: 'Buka Terms & Knowledge', section: 'Navigasi', run: () => { window.location.href = '/terms'; } },
  { id: 'open-graph', label: 'Buka Knowledge Graph', section: 'Navigasi', run: () => { window.location.href = '/graph'; } },
  { id: 'open-review', label: 'Buka Review', keywords: 'flashcard srs recite', section: 'Navigasi', run: () => { window.location.href = '/review'; } },
  { id: 'open-progress', label: 'Buka Progress (Mastery Map)', keywords: 'mastery badge skill tree', section: 'Navigasi', run: () => { window.location.href = '/progress'; } },
  { id: 'open-search', label: 'Buka halaman Search', section: 'Navigasi', run: () => { window.location.href = '/search'; } },
  { id: 'open-about', label: 'Buka About Learnitas', section: 'Navigasi', run: () => { window.location.href = '/about'; } },
  { id: 'open-api', label: 'Buka dokumentasi API', keywords: 'json endpoint developer agent', section: 'Navigasi', run: () => { window.location.href = '/api'; } },
  { id: 'random-note', label: 'Buka catatan acak', keywords: 'surprise dice random', section: 'Navigasi', run: () => clickById('random-note-btn') },

  { id: 'toggle-theme', label: 'Ganti tema Cream / Dark', keywords: 'dark light mode terang gelap', section: 'Tampilan', run: () => clickById('theme-toggle') },
  { id: 'toggle-crt', label: 'Toggle retro CRT mode', section: 'Tampilan', run: () => clickById('crt-toggle-btn') },
  { id: 'toggle-ipad', label: 'Toggle iPad mode', keywords: 'pencil annotate touch anotasi', section: 'Tampilan', run: () => clickById('ipad-mode-toggle-btn') },
  { id: 'toggle-navbar', label: 'Sembunyikan / tampilkan navbar', section: 'Tampilan', run: () => clickById('navbar-hide-btn') },
  { id: 'toggle-sidebar', label: 'Sembunyikan / tampilkan sidebar', section: 'Tampilan', available: () => !!document.getElementById('sidebar-collapse-btn'), run: () => clickById('sidebar-collapse-btn') },

  { id: 'open-bookmarks', label: 'Buka Bookmarks', section: 'Aksi', run: () => clickById('bookmarks-btn') },
  { id: 'open-assistant', label: 'Buka Study Assistant', keywords: 'ai chat tanya asisten', section: 'Aksi', run: () => clickById('assistant-toggle-btn') },
  {
    id: 'open-study-canvas',
    label: 'Buka Study Canvas untuk catatan ini',
    keywords: 'canvas draw gambar',
    section: 'Aksi',
    available: () => !!document.getElementById('study-canvas-overlay'),
    run: () => document.dispatchEvent(new CustomEvent('learnitas:study-canvas-open', { detail: { route: location.pathname } })),
  },
];
