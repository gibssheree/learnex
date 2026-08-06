/** Pure, client-safe computation over the group/note structure served by
 * /mastery-index.json combined with the SRS state already tracked in
 * srs-client.ts. No new persistence layer — "mastery" is a derived view of
 * data that already exists (author-curated `known` status + review history),
 * not a separately stored credential. */

import type { CardState } from './srs-client';

export interface MasteryNote {
  route: string;
  title: string;
  known?: boolean;
}

export interface MasteryGroup {
  key: string;
  label: string;
  kind: 'language-category' | 'term-domain';
  notes: MasteryNote[];
}

export interface MasteryIndex {
  languageGroups: MasteryGroup[];
  termGroups: MasteryGroup[];
}

export interface GroupProgress {
  key: string;
  label: string;
  kind: MasteryGroup['kind'];
  total: number;
  masteredCount: number;
  percent: number;
  isFullyMastered: boolean;
}

/** A note counts as "successfully reviewed" once its SRS state's `reps` is
 * at least 1. `grade()` in srs-client.ts resets `reps` to 0 on an "again"
 * grade, so `reps >= 1` means this card's most recent review succeeded —
 * a fair proxy for "you've got this" without needing a separate review-
 * history log the SRS scheduler doesn't otherwise keep. */
function reviewedSuccessfully(states: Record<string, CardState>, route: string): boolean {
  return (states[route]?.reps ?? 0) >= 1;
}

export function computeGroupProgress(groups: MasteryGroup[], states: Record<string, CardState>): GroupProgress[] {
  return groups.map((g) => {
    const masteredCount = g.notes.filter((n) => n.known || reviewedSuccessfully(states, n.route)).length;
    const total = g.notes.length;
    return {
      key: g.key,
      label: g.label,
      kind: g.kind,
      total,
      masteredCount,
      percent: total === 0 ? 0 : Math.round((masteredCount / total) * 100),
      isFullyMastered: total > 0 && masteredCount === total,
    };
  });
}

export function overallPercent(progress: GroupProgress[]): number {
  const total = progress.reduce((s, g) => s + g.total, 0);
  const mastered = progress.reduce((s, g) => s + g.masteredCount, 0);
  return total === 0 ? 0 : Math.round((mastered / total) * 100);
}
