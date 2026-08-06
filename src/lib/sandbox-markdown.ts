/** Turns ```js:run / ```python:run fenced blocks into a runnable code
 * sandbox, before the markdown body reaches Astro's renderMarkdown().
 *
 * Why pre-process the raw markdown text instead of hooking into Shiki/the
 * rendered HTML: verified empirically against this exact codebase's dev
 * server that an unrecognized fence language (e.g. "js:run") collapses to
 * `data-language="plaintext"` with zero trace of the original string —
 * Shiki's syntax highlighter has already thrown that information away by
 * the time rendered HTML exists, so there'd be nothing reliable to detect
 * client-side. Raw HTML embedded directly in the markdown *source*, on the
 * other hand, was verified to pass through Astro's content renderer
 * untouched — so this replaces each matching fence with a lightweight
 * `<div data-lx-sandbox>` placeholder (code safely round-tripped through
 * base64, not string-interpolated into an attribute) that
 * CodeSandbox.astro finds and enhances client-side after mount.
 */

const SANDBOX_FENCE_RE = /```(js|python):run\r?\n([\s\S]*?)```/g;

export function injectCodeSandboxes(body: string): string {
  return body.replace(SANDBOX_FENCE_RE, (_match, lang: string, code: string) => {
    const trimmed = code.replace(/\n$/, '');
    const encoded = Buffer.from(trimmed, 'utf-8').toString('base64');
    // Blank lines on both sides so CommonMark treats this as its own HTML
    // block rather than getting swallowed into a neighboring paragraph.
    return `\n\n<div class="lx-sandbox" data-lx-sandbox data-lang="${lang}" data-code="${encoded}"></div>\n\n`;
  });
}
