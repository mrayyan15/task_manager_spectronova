import type { TaskPriority } from '../BLL/taskManager/types';

export interface StatusBadgeColors {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

export interface PriorityBadgeColors {
  label: string;
  bg: string;
  text: string;
}

export const STATUS_BADGE_COLORS: Record<string, StatusBadgeColors> = {
  todo: {
    label: 'Not Started',
    bg: '#f3f0ff',
    text: '#4f46e5',
    dot: '#4f46e5',
  },
  'in-progress': {
    label: 'In Research',
    bg: '#fff7ed',
    text: '#f59e0b',
    dot: '#f59e0b',
  },
  done: {
    label: 'Complete',
    bg: '#f0fdf4',
    text: '#166534',
    dot: '#22c55e',
  },
};

export const PRIORITY_BADGE_COLORS: Record<TaskPriority, PriorityBadgeColors> = {
  high: {
    label: 'High',
    bg: '#fee2e2',
    text: '#b91c1c',
  },
  medium: {
    label: 'Medium',
    bg: '#fef3c7',
    text: '#d97706',
  },
  low: {
    label: 'Low',
    bg: '#eff6ff',
    text: '#2563eb',
  },
};

export function getStatusBadgeColors(statusId: string): StatusBadgeColors {
  return (
    STATUS_BADGE_COLORS[statusId] ?? {
      label: statusId,
      bg: '#f3f4f6',
      text: '#6b7280',
      dot: '#9ca3af',
    }
  );
}

export function getPriorityBadgeColors(
  priority: TaskPriority,
): PriorityBadgeColors {
  return PRIORITY_BADGE_COLORS[priority];
}
