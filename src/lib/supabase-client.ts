import { createBrowserClient } from '@supabase/ssr';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    '[supabase-client] PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY are not set — accounts, sync, and the hosted Study Assistant are disabled. The rest of the site is unaffected.',
  );
}

// Placeholder values (never throws) so a missing/misconfigured env var never
// breaks the fully-static, guest-readable site — only auth-dependent calls
// fail, the same as any other network error already handled by callers.
export const supabase = createBrowserClient(url || 'https://placeholder.invalid', anonKey || 'placeholder-anon-key');
