const AVATAR_PALETTE: readonly string[] = [
  '#5c6bc0',
  '#26a69a',
  '#ef5350',
  '#ab47bc',
  '#42a5f5',
  '#66bb6a',
  '#ffa726',
  '#8d6e63',
  '#ec407a',
  '#7e57c2',
  '#29b6f6',
  '#9ccc65',
] as const;

const UNASSIGNED_AVATAR_COLOR = '#94a3b8';

/**
 * Returns a deterministic background color for an assignee avatar.
 * The same name always maps to the same color.
 */
export function getAssigneeAvatarColor(assignee: string): string {
  const normalized = assignee.trim();
  if (!normalized) {
    return UNASSIGNED_AVATAR_COLOR;
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}
