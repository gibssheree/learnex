import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

/** Server-side Supabase client for the one on-demand route that needs to
 * know who's asking (src/pages/api/assistant.ts). Reads the session cookie
 * from the incoming request and, on token refresh, writes updated cookies
 * back onto the response via Astro's cookie API — never share this client
 * across requests, create a fresh one per call. */
export function createSupabaseServerClient(request: Request, cookies: AstroCookies) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  return createServerClient(url || 'https://placeholder.invalid', anonKey || 'placeholder-anon-key', {
    cookies: {
      getAll() {
        return parseCookieHeader(request.headers.get('Cookie') ?? '');
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, options);
        }
      },
    },
  });
}
