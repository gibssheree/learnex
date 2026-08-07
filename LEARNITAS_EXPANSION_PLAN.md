# Learnitas — Expansion Plan (fitur lengkap, khas, tersentralisasi — bukan rewrite)

## Konteks

Dokumen "Learnitas Enterprise: The Ultimate Master Blueprint" mengusulkan pivot ke SaaS
multi-tenant skala enterprise (akun pengguna, PostgreSQL, vector DB tersharding, WebRTC
multiplayer, WebContainers, generative 3D, kredensial blockchain, dashboard guru). Setelah
dianalisa terhadap codebase yang sebenarnya, arah itu ditolak: **Learnitas tetap situs statis,
single-author, local-first** — tanpa akun, tanpa database, seluruh state pengguna (bookmark,
progres SRS, coretan) tetap hidup di `localStorage`/IndexedDB milik browser masing-masing
pengguna, persis seperti sekarang.

Yang diambil dari blueprint itu bukan arsitekturnya, tapi **niatnya**: fitur harus lengkap,
khas (unik), dan terasa satu sistem (tersentralisasi) — bukan kumpulan halaman terpisah.
Plan ini menerjemahkan niat itu jadi fitur yang benar-benar bisa dibangun di atas fondasi
yang sudah ada: Astro static-first, satu route serverless (`src/pages/api/assistant.ts`),
RAG berbasis file JSON (`src/lib/rag.ts`), dan seluruh persistensi client-side.

**"Tersentralisasi" di sini bukan berarti backend terpusat** (itu butuh akun+DB, yang
sengaja dihindari) — melainkan **satu titik masuk yang konsisten** ke semua kapabilitas
(cari, AI, canvas, graph, review, bookmark) dari halaman mana pun, supaya situs terasa satu
sistem yang koheren, bukan `/graph`, `/review`, `/search` yang berdiri sendiri-sendiri.

**"Khas" (unik)** berarti memperdalam apa yang sudah membedakan Learnitas — catatan pribadi
yang jujur dan bisa salah (bukan referensi generik), graph berbasis `[[wikilink]]` asli,
estetika ilustrasi klasik, dan anotasi Pencil/touch yang tactile — bukan mengejar paritas
fitur generik dengan Educative/Coursera/MIT OCW.

## Prinsip desain (batasan yang sengaja dipertahankan)

- **Tidak ada akun pengguna, tidak ada database.** Semua fitur baru harus jalan dengan
  `localStorage`/IndexedDB, atau stateless di server (seperti `api/assistant.ts` sekarang).
- **Tidak ada multi-tenant.** Satu vault, satu penulis, seperti sekarang (`content/` disinkron
  manual lewat `scripts/sync-content.mjs`).
- **Biaya operasional tetap kecil.** Ini proyek solo di Vercel Hobby-tier + panggilan API
  Gemini/TTS pay-per-use — bukan proyek dengan anggaran infra enterprise.
- **Setiap fitur baru harus menumpang pola yang sudah terbukti**, bukan memperkenalkan
  teknologi baru yang berat (Docker-in-browser, blockchain, WebRTC) tanpa alasan kuat.

## Ringkasan rekomendasi (urutan prioritas)

1. **Command Palette + workspace terpadu** — dampak "tersentralisasi" paling langsung,
   biaya paling murah, tidak butuh backend baru sama sekali. Prioritas tertinggi.
2. **AI Studio diperdalam** (persona, opsi local LLM/BYOC, visual ringan) — menumpang
   langsung di atas `StudyAssistant.astro` + `api/assistant.ts` yang sudah jalan.
3. **Peta penguasaan (mastery map)** — menumpang data SRS yang sudah ada, nol infra baru.
4. **Sandbox kode ringan** (2 bahasa, client-side) — nilai tinggi untuk catatan bahasa
   pemrograman, tanpa biaya Docker/WebContainers.
5. **Living API publik read-only** — bagian paling realistis dari ide "Oracle for agents"
   di blueprint asli; murah karena kontennya memang sudah publik dan statis.
6. **3D showcase terbatas (opsional, ditunda)** — hanya dikerjakan kalau 1–5 sudah stabil
   dan minat pengguna nyata, bukan komitmen dari awal.

Yang sengaja **tidak** direkomendasikan dijelaskan di bagian akhir dokumen ini beserta alasannya.

---

## Fase 1 — Command Palette & Workspace Terpadu

### Tujuan
Ini adalah jawaban langsung untuk "tersentralisasi": satu shortcut (`Cmd/Ctrl+K`) yang bisa
dipanggil dari halaman mana pun untuk lompat ke catatan, mengubah mode (tema, iPad mode),
membuka AI Studio, Study Canvas, Review, atau Graph — tanpa reload halaman.

### Desain
- **Command Palette baru** (`src/components/CommandPalette.astro`, dipasang sekali di
  `BaseLayout.astro` seperti `StudyAssistant`) — modal overlay dengan fuzzy-search, sumber
  datanya: `random-index.json.ts` (daftar semua judul+route, sudah ada) untuk navigasi, plus
  daftar aksi statis (toggle tema, toggle CRT, toggle iPad mode, buka Review, buka Graph,
  buka Study Assistant, buka Study Canvas untuk catatan aktif).
- **Global keydown listener** mirip pola `/` untuk fokus search di `Header.astro` — tambahkan
  `Cmd/Ctrl+K` yang membuka palette dari halaman mana pun.
- **Study Canvas jadi kerangka workspace ringan**: `StudyCanvas.astro` sudah punya 3 pane
  (reference / drawing / assistant dock) — perluas dengan toggle pane keempat: **"Focused
  Graph"**, subgraph 2-hop dari catatan aktif dihitung di client dari `graph-data.json`
  (endpoint yang sudah ada), bukan graph global penuh. Ini secara langsung mewujudkan ide
  "personalized, progressively expanding graph" dari blueprint asli — tanpa backend per-user,
  karena subgraph-nya deterministik dari data link yang sudah ada.
- Pane bisa ditutup/dibuka via tombol kecil di header Study Canvas, state pane mana yang
  aktif disimpan di `localStorage` (`learnitas-canvas-panes`) supaya preferensi user persist.

### File — baru
| File | Tujuan |
|---|---|
| `src/components/CommandPalette.astro` | Modal command palette + fuzzy search, aksi navigasi & toggle |
| `src/lib/commands.ts` | Daftar aksi statis (toggle tema/CRT/ipad, buka Review/Graph/dsb) dipisah dari komponen agar mudah ditambah |

### File — dimodifikasi
| File | Perubahan |
|---|---|
| `src/layouts/BaseLayout.astro` | Mount `<CommandPalette />`, listener `Cmd/Ctrl+K` |
| `src/components/StudyCanvas.astro` | Tambah pane "Focused Graph" (subgraph 2-hop client-side dari `/graph-data.json`), toggle pane tersimpan di localStorage |
| `src/components/Header.astro` | Tombol kecil "⌘K" di toolbar sebagai discovery, memicu event yang sama dengan shortcut |

### Verifikasi
1. Tekan `Cmd/Ctrl+K` di halaman mana pun → palette muncul, ketik judul catatan → Enter
   membuka route yang benar.
2. Dari palette, toggle tema/iPad mode bekerja identik dengan tombol di `Header.astro`.
3. Buka Study Canvas di sebuah catatan, aktifkan pane "Focused Graph" → hanya menampilkan
   2-hop neighbor dari catatan itu, klik node lain memuat ulang canvas untuk catatan tsb.

---

## Fase 2 — AI Studio: Persona, BYOC/Local LLM, Visual Ringan

### Tujuan
Memperdalam Study Assistant yang sudah ada (RAG + voice mode) tanpa menambah infra baru,
mengambil ide persona & "visualisasi generatif" dari blueprint tapi diskalakan realistis.

### Desain
- **Persona AI Tutor** (Socratic / Direct / Encouraging) — pilihan tersimpan di
  `localStorage` (`learnitas-ai-persona`), dikirim sebagai bagian body request ke
  `api/assistant.ts`, yang menyisipkan variasi kalimat ke `systemInstruction()` (fungsi ini
  sudah ada dan sudah menerima `currentPage` — tinggal tambah parameter `persona`). Tidak ada
  perubahan arsitektur, murni tambahan string di system prompt.
- **BYOC / Local LLM (Ollama)** — opsi di panel Study Assistant: "Use local model
  (localhost:11434)". Kalau aktif, request **tidak** lewat `/api/assistant` sama sekali —
  browser fetch langsung ke endpoint lokal Ollama pengguna (`http://localhost:11434/api/chat`),
  karena Ollama memang expose HTTP API lokal yang bisa diakses langsung dari browser tanpa
  server tambahan. `search_vault` tetap bisa dipakai sebagai tool call kalau model lokal
  mendukung function calling; kalau tidak, fallback ke mode tanpa RAG. Ini murni penambahan
  jalur klien, nol biaya server, dan sesuai semangat privasi power-user di blueprint asli.
- **Visual ringan, bukan generative 3D** — ganti ambisi "AI generates 3D model" jadi
  **AI menghasilkan diagram Mermaid/SVG sederhana** ketika diminta ("visualisasikan binary
  search tree ini") dirender di pane Study Canvas yang sudah ada. Ini memberi nilai yang sama
  (abstrak → visual) tanpa Three.js/WebGL/biaya API generative-3D pihak ketiga.

### File — dimodifikasi
| File | Perubahan |
|---|---|
| `src/pages/api/assistant.ts` | Terima `persona` di body, variasikan `systemInstruction()`; tambah deteksi permintaan visual → minta model balas blok ```mermaid |
| `src/components/StudyAssistant.astro` | Selector persona di header panel; toggle "local model"; render blok mermaid di bubble balasan (reuse `renderMarkdown()` yang sudah ada, tambah case untuk fence `mermaid`) |
| `src/components/StudyCanvas.astro` | Terima event render-diagram dari assistant, gambar ke drawing pane sebagai overlay non-destruktif (tidak masuk stroke history) |

### Verifikasi
1. Ganti persona ke "Direct" → jawaban dari `/api/assistant` terasa lebih ringkas, tanpa
   pertanyaan balik (spot-check manual).
2. Aktifkan local model dengan Ollama jalan di `localhost:11434` → chat berfungsi tanpa
   memanggil `/api/assistant` (cek Network tab, tidak ada request ke route itu).
3. Minta "visualisasikan urutan queue FIFO" → balasan berisi diagram yang ter-render, bukan
   teks mermaid mentah.

---

## Fase 3 — Mastery Map (progres, tanpa akun/blockchain)

### Tujuan
Versi realistis dari "RPG skill tree + verifiable credentials" — progres visual per
domain, murni dari data yang sudah dikumpulkan `srs-client.ts`, tanpa backend, tanpa
kredensial kripto.

### Desain
- **Mastery Map** halaman baru `/progress`, reuse gaya visual `MindMap.astro` (SVG radial)
  tapi datanya: persentase "known"/direview per kategori bahasa & domain term, dihitung dari
  `loadStates()` (SRS) + flag `status: 'known'` yang sudah ada di frontmatter catatan.
  100% client-side, dibaca saat halaman dimuat.
- **Badge lokal** (bukan blockchain) — ketika semua catatan dalam satu domain sudah
  berstatus "reviewed & good/easy" minimal sekali, domain itu dapat badge visual (ikon pixel
  baru di `pixelIcons.ts`) ditampilkan di Mastery Map dan di `Sidebar.astro`. Disimpan sebagai
  computed value, bukan state tersendiri — jadi tidak bisa "dipalsukan" via localStorage
  editing lebih dari SRS state itu sendiri sudah bisa (batasan yang sama seperti sistem SRS
  sekarang, dan itu memang cukup untuk personal tool, bukan kredensial yang diverifikasi
  pihak ketiga).
- **Nudge prasyarat ringan** — pendekatan realistis untuk "adaptive curriculum": kalau sebuah
  catatan digrading "again" berulang kali di `/review`, tampilkan saran kecil di kartu review
  yang menunjuk ke backlink/related note (dari `getBacklinksFor()` yang sudah ada) sebagai
  "mungkin baca ini dulu" — heuristik sederhana, bukan model prediksi.

### File — baru
| File | Tujuan |
|---|---|
| `src/pages/progress/index.astro` | Halaman Mastery Map |
| `src/lib/mastery.ts` | Hitung persentase & badge dari SRS state + status frontmatter |

### File — dimodifikasi
| File | Perubahan |
|---|---|
| `src/pages/review/index.astro` | Tampilkan nudge terkait backlink saat grade "again" berulang |
| `src/components/Sidebar.astro` | Ikon badge kecil di sebelah domain yang sudah "mastered" |

### Verifikasi
1. Review beberapa catatan sampai grade "good"/"easy" → `/progress` menunjukkan persentase
   naik untuk kategori terkait.
2. Grade sebuah catatan "again" 3x berturut-turut di sesi berbeda → muncul saran backlink di
   kartu berikutnya untuk catatan itu.

---

## Fase 4 — Sandbox Kode (scoped, client-side)

### Tujuan
Nilai "Interactive Sandbox" dari blueprint, diskalakan ke yang benar-benar bisa dijalankan
gratis di browser tanpa server eksekusi.

### Desain
- **Dua bahasa dulu**: JavaScript (native, jalankan di Web Worker terisolasi — bukan `eval`
  langsung di halaman, untuk keamanan) dan Python (via Pyodide, WASM, load on-demand).
  Bukan Docker/WebContainers — tidak ada biaya lisensi, tidak ada server eksekusi untuk
  diamankan/dijaga.
- Muncul sebagai blok kode "runnable" di catatan bahasa pemrograman yang relevan (mis. di
  `content/Programming Languages/JavaScript.md` / `Python.md`) — ditandai lewat fence khusus
  (```js:run) yang dideteksi saat render markdown, mengaktifkan tombol "Run" + area output.
- Output error/hasil run **tidak** dikirim ke server mana pun — murni in-browser, konsisten
  dengan prinsip local-first.

### File — baru
| File | Tujuan |
|---|---|
| `src/components/CodeSandbox.astro` | Tombol Run + area output, deteksi bahasa (js/python) |
| `src/lib/sandbox-runners.ts` | Runner JS (Web Worker) & Python (Pyodide loader) |

### File — dimodifikasi
| File | Perubahan |
|---|---|
| `src/loaders/vaultLoader.ts` / render pipeline | Deteksi fence ```js:run / ```python:run, bungkus dengan `<CodeSandbox>` saat render |

### Verifikasi
1. Buka catatan Python dengan blok `python:run` → klik Run → output muncul tanpa reload,
   tanpa request jaringan ke server Learnitas.
2. Kode dengan infinite loop tidak membekukan tab (Worker bisa di-terminate via tombol Stop).

---

## Fase 5 — Living API Publik (read-only)

### Tujuan
Bagian paling realistis dari "Oracle for autonomous agents": konten vault memang sudah
publik dan statis, jadi mengeksposnya sebagai API terstruktur itu murah dan bernilai —
tanpa auth kompleks atau infra agent-registration yang berlebihan di awal.

### Desain
- Formalkan pola yang sudah ada (`graph-data.json.ts`, `flashcards-index.json.ts`) jadi API
  yang didokumentasikan: `GET /api/v1/notes`, `GET /api/v1/notes/[route]`,
  `GET /api/v1/search?q=`. Semua read-only, semua dari `getCollection()` yang sudah ada —
  tidak ada data baru yang perlu disiapkan.
- **Rate limiting sederhana** dulu (IP-based, in-memory per edge instance atau Vercel's
  bawaan) — bukan sistem API-key/registrasi agent penuh di awal. Upgrade ke API key hanya
  kalau abuse jadi masalah nyata.
- Halaman `/about` (atau halaman baru `/api`) mendokumentasikan endpoint ini secara terbuka —
  konsisten dengan sikap situs yang sudah transparan soal cara kerjanya.
- **Tidak** membuat "SDK untuk ChatGPT/Hermes/Open Claw" — cukup skema OpenAPI/JSON yang
  bisa dikonsumsi tool apa pun tanpa nama produk pihak ketiga yang mengikat.

### File — baru
| File | Tujuan |
|---|---|
| `src/pages/api/v1/notes.json.ts` | Daftar semua catatan + metadata (title, route, domain, summary) |
| `src/pages/api/v1/notes/[...route].json.ts` | Detail satu catatan (body markdown terender + metadata) |
| `src/pages/api/v1/search.json.ts` | Wrapper tipis di atas Pagefind index / fallback ke pencarian judul sederhana |
| `src/pages/api/index.astro` (atau bagian di `/about`) | Dokumentasi endpoint publik |

### Verifikasi
1. `curl /api/v1/notes.json` mengembalikan daftar lengkap tanpa perlu autentikasi.
2. Request beruntun cepat dari satu IP mulai dibatasi (429) setelah ambang tertentu.

---

## Fase 6 (opsional, ditunda) — 3D Showcase Terbatas

Hanya dikerjakan setelah Fase 1–5 stabil **dan** ada sinyal minat nyata dari pengguna.
Kalau dilanjutkan: **1–2 model buatan tangan** (bukan pipeline generative-3D) untuk konsep
yang paling diuntungkan visual 3D (mis. motherboard di catatan Computer Architecture),
pakai `react-three-fiber` sebagai island Astro tunggal, dimuat lazy hanya di catatan itu —
bukan modul global yang dipasang di semua halaman.

---

## Yang sengaja TIDAK diambil dari blueprint Enterprise (dan kenapa)

| Ide di blueprint | Kenapa didrop / ditunda |
|---|---|
| Akun pengguna + PostgreSQL + multi-tenant | Bertentangan langsung dengan keputusan "bukan mengganti" — mengubah seluruh model kepercayaan & biaya operasional proyek solo ini. |
| Vector DB tersharding "jutaan konsep" | Vault ini ~450 catatan; brute-force cosine di `rag.ts` sudah cukup untuk skala ini bertahun-tahun ke depan. |
| Behavioral tracking + heatmap + dashboard guru | Butuh melacak pengguna sungguhan (berpotensi anak sekolah) → masuk wilayah kepatuhan privasi pendidikan yang serius, di luar kapasitas proyek personal. |
| Kredensial terverifikasi via blockchain | Menyelesaikan masalah trust yang belum ada yang minta; menambah kompleksitas keamanan (custody kunci, revokasi) tanpa demand yang tervalidasi. |
| Docker/WebContainers multi-bahasa penuh | Biaya lisensi & kompleksitas jauh melebihi skala situs; 2 bahasa client-side (Fase 4) memberi 80% nilai di 5% biaya. |
| Multiplayer real-time (WebRTC/WebSocket) | Butuh identitas pengguna + infra real-time baru total; tidak ada permintaan tervalidasi untuk kolaborasi live di tool personal. |
| SDK bernama produk pihak ketiga (ChatGPT/Hermes/Open Claw) | Bukan deliverable teknis nyata — cukup API terdokumentasi (Fase 5) yang bisa dikonsumsi siapa pun. |
| Generative 3D on-demand (Meshy/Luma) | Biaya API berulang + kompleksitas pipeline tidak sepadan; diagram Mermaid ringan (Fase 2) memberi manfaat serupa untuk konsep abstrak. |

## Urutan eksekusi yang disarankan

Fase 1 → 2 → 3 saling independen secara teknis tapi disusun begini karena **Fase 1 adalah
fondasi UX** yang membuat fase-fase berikutnya (assistant persona, mastery map, sandbox)
punya "rumah" yang konsisten untuk ditampilkan (lewat command palette & Study Canvas pane),
bukan fitur yang tersebar lagi. Fase 4 dan 5 bisa paralel kapan saja setelah Fase 1 selesai,
karena keduanya tidak bergantung pada AI Studio atau Mastery Map. Fase 6 sengaja diletakkan
terakhir dan bersyarat.
