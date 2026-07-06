import { reactive } from 'vue';
import type {
  Task,
  TaskStatus,
  TaskPriority,
  FilterConfig,
  SortConfig,
  KanbanColumnConfig,
  Assignee,
  ActiveView,
  StatusBadgeMeta,
  PriorityBadgeMeta,
} from './types';
import {
  ASSIGNEES,
  parseAssigneeNames,
  isActiveView,
  isSortField,
  isSortDirection,
} from './types';
import { mockTasks } from './mockData';
import {
  getPriorityBadgeColors,
  getStatusBadgeColors,
  STATUS_BADGE_COLORS,
} from '../../utils/badgeColors';

const STORAGE_KEYS = {
  activeView: 'taskManager-activeView',
  sort: 'taskManager-sort',
  filters: 'taskManager-filters',
} as const;

const DEFAULT_KANBAN_COLUMNS: KanbanColumnConfig[] = [
  { id: 'todo', title: 'To do', dotColor: '#f59e0b' },
  { id: 'in-progress', title: 'In Progress', dotColor: '#3b82f6' },
  { id: 'done', title: 'Done', dotColor: '#d946ef' },
];

const EXTRA_COLUMN_COLORS: readonly string[] = [
  '#ec4899',
  '#14b8a6',
  '#f59e0b',
  '#6366f1',
  '#84cc16',
  '#0ea5e9',
];

const DEFAULT_SORT: SortConfig = {
  field: 'dueDate',
  direction: 'asc',
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
};

interface TaskManagerState {
  tasks: Task[];
  columns: KanbanColumnConfig[];
  activeView: ActiveView;
  filters: FilterConfig;
  searchQuery: string;
  sort: SortConfig;
}

function loadActiveView(): ActiveView {
  const saved = localStorage.getItem(STORAGE_KEYS.activeView);
  return isActiveView(saved) ? saved : 'kanban';
}

function loadSort(): SortConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.sort);
    if (!raw) {
      return { ...DEFAULT_SORT };
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'field' in parsed &&
      'direction' in parsed &&
      typeof parsed.field === 'string' &&
      typeof parsed.direction === 'string' &&
      isSortField(parsed.field) &&
      isSortDirection(parsed.direction)
    ) {
      return { field: parsed.field, direction: parsed.direction };
    }
  } catch {
    // Ignore corrupt storage and fall back to defaults.
  }

  return { ...DEFAULT_SORT };
}

function loadFilters(): FilterConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.filters);
    if (!raw) {
      return {};
    }

    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return {};
    }

    const filters: FilterConfig = {};

    if ('priority' in parsed) {
      const priority = parsed.priority;
      if (
        priority === null ||
        priority === 'low' ||
        priority === 'medium' ||
        priority === 'high'
      ) {
        filters.priority = priority;
      }
    }

    if ('assignee' in parsed) {
      const assignee = parsed.assignee;
      if (assignee === null || typeof assignee === 'string') {
        filters.assignee = assignee;
      }
    }

    return filters;
  } catch {
    return {};
  }
}

function saveSort(sort: SortConfig): void {
  localStorage.setItem(STORAGE_KEYS.sort, JSON.stringify(sort));
}

function saveFilters(filters: FilterConfig): void {
  localStorage.setItem(
    STORAGE_KEYS.filters,
    JSON.stringify({
      priority: filters.priority ?? null,
      assignee: filters.assignee ?? null,
    }),
  );
}

export class TaskManager {
  readonly state: TaskManagerState;

  constructor() {
    this.state = reactive({
      tasks: [...mockTasks],
      columns: DEFAULT_KANBAN_COLUMNS.map((column) => ({ ...column })),
      activeView: loadActiveView(),
      filters: loadFilters(),
      searchQuery: '',
      sort: loadSort(),
    });
  }

  getColumns(): KanbanColumnConfig[] {
    return this.state.columns;
  }

  addColumn(title?: string): KanbanColumnConfig {
    const trimmed = title?.trim();
    const columnTitle = trimmed || `Column ${this.state.columns.length + 1}`;
    const colorIndex =
      (this.state.columns.length - DEFAULT_KANBAN_COLUMNS.length) %
      EXTRA_COLUMN_COLORS.length;
    const dotColor =
      EXTRA_COLUMN_COLORS[Math.max(0, colorIndex)] ?? EXTRA_COLUMN_COLORS[0];

    const column: KanbanColumnConfig = {
      id: `col-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: columnTitle,
      dotColor,
    };

    this.state.columns.push(column);
    return column;
  }

  getTasks(): Task[] {
    return this.sortTasks(this.filterTasks(this.state.tasks));
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    const byStatus = this.state.tasks.filter((task) => task.status === status);
    return this.sortTasks(this.filterTasks(byStatus));
  }

  addTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };
    this.state.tasks.push(newTask);
    return newTask;
  }

  updateTask(id: string, updates: Partial<Task>): Task | undefined {
    const index = this.state.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return undefined;
    }

    const updated: Task = {
      ...this.state.tasks[index],
      ...updates,
      id,
    };
    this.state.tasks[index] = updated;
    return updated;
  }

  deleteTask(id: string): boolean {
    const index = this.state.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      return false;
    }
    this.state.tasks.splice(index, 1);
    return true;
  }

  moveTo(taskId: string, newStatus: TaskStatus): Task | undefined {
    return this.updateTask(taskId, { status: newStatus });
  }

  setFilter(filters: FilterConfig): void {
    this.state.filters = {
      ...this.state.filters,
      ...filters,
    };
    saveFilters(this.state.filters);
  }

  setSearchQuery(query: string): void {
    this.state.searchQuery = query;
  }

  setSort(sort: SortConfig): void {
    this.state.sort = { ...sort };
    saveSort(this.state.sort);
  }

  toggleView(view: ActiveView): void {
    this.state.activeView = view;
    localStorage.setItem(STORAGE_KEYS.activeView, view);
  }

  getAssignees(): Assignee[] {
    return ASSIGNEES;
  }

  getAssigneeFilterOptions(): { names: string[]; hasUnassigned: boolean } {
    const hasUnassigned = this.state.tasks.some(
      (task) => parseAssigneeNames(task.assignee).length === 0,
    );

    return {
      names: ASSIGNEES.map((person) => person.name),
      hasUnassigned,
    };
  }

  isOverdue(task: Task): boolean {
    if (task.status === 'done') {
      return false;
    }
    return this.isDueDateInPast(task.dueDate);
  }

  isDueDateInPast(isoDate: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(`${isoDate}T00:00:00`);
    return due < today;
  }

  formatDueDate(isoDate: string): string {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getStatusBadgeMeta(status: TaskStatus): StatusBadgeMeta {
    const builtin = STATUS_BADGE_COLORS[status];
    if (builtin) {
      return {
        label: builtin.label,
        dotColor: builtin.dot,
        textColor: builtin.text,
        backgroundColor: builtin.bg,
      };
    }

    const column = this.state.columns.find((col) => col.id === status);
    if (column) {
      return {
        label: column.title,
        dotColor: column.dotColor,
        textColor: column.dotColor,
        backgroundColor: `${column.dotColor}1a`,
      };
    }

    const fallback = getStatusBadgeColors(status);
    return {
      label: fallback.label,
      dotColor: fallback.dot,
      textColor: fallback.text,
      backgroundColor: fallback.bg,
    };
  }

  getPriorityBadgeMeta(priority: TaskPriority): PriorityBadgeMeta {
    const colors = getPriorityBadgeColors(priority);
    return {
      label: colors.label,
      textColor: colors.text,
      backgroundColor: colors.bg,
    };
  }

  private filterTasks(tasks: Task[]): Task[] {
    const { priority, assignee } = this.state.filters;
    const query = this.state.searchQuery.trim().toLowerCase();

    return tasks.filter((task) => {
      if (priority != null && task.priority !== priority) {
        return false;
      }
      if (assignee != null) {
        const taskAssignees = parseAssigneeNames(task.assignee);
        if (assignee === '') {
          if (taskAssignees.length > 0) {
            return false;
          }
        } else if (!taskAssignees.includes(assignee)) {
          return false;
        }
      }
      if (query && !this.taskMatchesSearch(task, query)) {
        return false;
      }
      return true;
    });
  }

  private taskMatchesSearch(task: Task, query: string): boolean {
    if (task.title.toLowerCase().includes(query)) {
      return true;
    }
    if (task.description.toLowerCase().includes(query)) {
      return true;
    }
    if (task.tags.some((tag) => tag.toLowerCase().includes(query))) {
      return true;
    }
    return parseAssigneeNames(task.assignee).some((name) =>
      name.toLowerCase().includes(query),
    );
  }

  private sortTasks(tasks: Task[]): Task[] {
    const { field, direction } = this.state.sort;
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...tasks].sort((a, b) => {
      if (field === 'dueDate') {
        return a.dueDate.localeCompare(b.dueDate) * multiplier;
      }
      return (PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]) * multiplier;
    });
  }

  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}
