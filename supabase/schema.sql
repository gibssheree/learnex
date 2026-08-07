-- Learnitas accounts: bookmarks, SRS review state, Study Assistant chat
-- history — one row (or row-set) per authenticated user. Paste into
-- Supabase Dashboard > SQL Editor > New query, run once. Safe to re-run.
--
-- No service_role key, no custom CRUD routes: the browser talks straight to
-- PostgREST using only the public anon key; every policy below scopes
-- access to auth.uid() so a user can only ever see/write their own rows.

-- ── Bookmarks ────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  url        text not null,
  title      text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, url)
);
alter table public.bookmarks enable row level security;

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks for select using (auth.uid() = user_id);
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "bookmarks_update_own" on public.bookmarks;
create policy "bookmarks_update_own" on public.bookmarks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks for delete using (auth.uid() = user_id);

-- ── SRS card state (mirrors CardState in src/lib/srs-client.ts) ───────────
create table if not exists public.srs_cards (
  user_id  uuid not null default auth.uid() references auth.users (id) on delete cascade,
  route    text not null,
  interval double precision not null,
  ease     double precision not null,
  due      date not null,
  reps     integer not null,
  primary key (user_id, route)
);
alter table public.srs_cards enable row level security;

drop policy if exists "srs_cards_select_own" on public.srs_cards;
create policy "srs_cards_select_own" on public.srs_cards for select using (auth.uid() = user_id);
drop policy if exists "srs_cards_insert_own" on public.srs_cards;
create policy "srs_cards_insert_own" on public.srs_cards for insert with check (auth.uid() = user_id);
drop policy if exists "srs_cards_update_own" on public.srs_cards;
create policy "srs_cards_update_own" on public.srs_cards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "srs_cards_delete_own" on public.srs_cards;
create policy "srs_cards_delete_own" on public.srs_cards for delete using (auth.uid() = user_id);

-- ── Study Assistant chat history ───────────────────────────────────────────
-- One continuously-overwritten thread per user (matches today's single
-- in-memory-conversation UX) — not a multi-conversation feature. The whole
-- ChatMessage[] array is upserted wholesale by src/pages/api/assistant.ts.
create table if not exists public.assistant_threads (
  user_id    uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  messages   jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.assistant_threads enable row level security;

drop policy if exists "assistant_threads_select_own" on public.assistant_threads;
create policy "assistant_threads_select_own" on public.assistant_threads for select using (auth.uid() = user_id);
drop policy if exists "assistant_threads_insert_own" on public.assistant_threads;
create policy "assistant_threads_insert_own" on public.assistant_threads for insert with check (auth.uid() = user_id);
drop policy if exists "assistant_threads_update_own" on public.assistant_threads;
create policy "assistant_threads_update_own" on public.assistant_threads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "assistant_threads_delete_own" on public.assistant_threads;
create policy "assistant_threads_delete_own" on public.assistant_threads for delete using (auth.uid() = user_id);
