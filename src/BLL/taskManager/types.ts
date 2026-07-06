export type TaskStatus = string;
export type TaskPriority = 'low' | 'medium' | 'high';
export type SortDirection = 'asc' | 'desc';
export type ActiveView = 'kanban' | 'list';

/** Built-in column ids; TaskStatus remains string for user-added columns. */
export type BuiltinTaskStatus = 'todo' | 'in-progress' | 'done';

export interface Assignee {
  id: string;
  name: string;
}

/** Canonical roster of people who can be assigned to tasks. */
export const ASSIGNEES: Assignee[] = [
  { id: 'davis-donin', name: 'Davis Donin' },
  { id: 'talan-korsgaard', name: 'Talan Korsgaard' },
  { id: 'maya-chen', name: 'Maya Chen' },
  { id: 'jordan-patel', name: 'Jordan Patel' },
];

export function parseAssigneeNames(assignee: string): string[] {
  return assignee
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
}

export function formatAssigneeNames(names: string[]): string {
  return names.join(', ');
}

export interface KanbanColumnConfig {
  id: string;
  title: string;
  dotColor: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string; // ISO date string, e.g. "2025-03-15"
  assignee: string;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
}

/** Discriminated union — sort field drives comparison logic in TaskManager. */
export type SortConfig =
  | { field: 'dueDate'; direction: SortDirection }
  | { field: 'priority'; direction: SortDirection };

export interface FilterConfig {
  priority?: TaskPriority | null;
  assignee?: string | null;
}

/** Discriminated union for task modal open state (create vs edit). */
export type TaskModalMode =
  | { kind: 'closed' }
  | { kind: 'create'; initialStatus: TaskStatus }
  | { kind: 'edit'; task: Task };

export function isCreateModalMode(
  mode: TaskModalMode,
): mode is { kind: 'create'; initialStatus: TaskStatus } {
  return mode.kind === 'create';
}

export function isEditModalMode(
  mode: TaskModalMode,
): mode is { kind: 'edit'; task: Task } {
  return mode.kind === 'edit';
}

export function isOpenModalMode(
  mode: TaskModalMode,
): mode is Exclude<TaskModalMode, { kind: 'closed' }> {
  return mode.kind !== 'closed';
}

export interface StatusBadgeMeta {
  label: string;
  dotColor: string;
  textColor: string;
  backgroundColor: string;
}

export interface PriorityBadgeMeta {
  label: string;
  textColor: string;
  backgroundColor: string;
}

export function isSortField(value: string): value is SortConfig['field'] {
  return value === 'dueDate' || value === 'priority';
}

export function isSortDirection(value: string): value is SortDirection {
  return value === 'asc' || value === 'desc';
}

export function isActiveView(value: string | null): value is ActiveView {
  return value === 'kanban' || value === 'list';
}
