import { supabase } from './supabase-client';

let currentUserId: string | null = null;
let currentEmail: string | null = null;

// Fires once for INITIAL_SESSION on page load (existing cookie, if any,
// already valid), then again on SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED.
// Module evaluation — where every listener below self-attaches at import
// time — is fully synchronous, and this callback is asynchronous, so every
// listener is guaranteed to already be registered before this can fire.
supabase.auth.onAuthStateChange((event, session) => {
  currentUserId = session?.user?.id ?? null;
  currentEmail = session?.user?.email ?? null;
  document.dispatchEvent(
    new CustomEvent('learnitas:auth-changed', {
      detail: { userId: currentUserId, email: currentEmail, event },
    }),
  );
});

export function getCurrentUserId(): string | null {
  return currentUserId;
}

export function getCurrentEmail(): string | null {
  return currentEmail;
}

export async function signUp(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
}

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
