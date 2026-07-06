<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../../BLL/taskManager/types';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import { openDeleteConfirm } from '../../utils/deleteConfirm';
import AssigneeAvatar from './AssigneeAvatar.vue';

const props = defineProps<{
  manager: TaskManager;
}>();

const emit = defineEmits<{
  edit: [task: Task];
}>();

const tasks = computed(() => props.manager.getTasks());
const sort = computed(() => props.manager.state.sort);

function statusBadgeStyle(task: Task) {
  const meta = props.manager.getStatusBadgeMeta(task.status);
  return {
    backgroundColor: meta.backgroundColor,
    color: meta.textColor,
  };
}

function statusLabel(task: Task): string {
  return props.manager.getStatusBadgeMeta(task.status).label;
}

function priorityBadgeStyle(task: Task) {
  const meta = props.manager.getPriorityBadgeMeta(task.priority);
  return {
    backgroundColor: meta.backgroundColor,
    color: meta.textColor,
  };
}

function priorityLabel(task: Task): string {
  return props.manager.getPriorityBadgeMeta(task.priority).label;
}

function toggleSort(field: 'dueDate' | 'priority'): void {
  if (sort.value.field === field) {
    props.manager.setSort({
      field,
      direction: sort.value.direction === 'asc' ? 'desc' : 'asc',
    });
    return;
  }

  props.manager.setSort({ field, direction: 'asc' });
}

function sortIndicator(field: 'dueDate' | 'priority'): string {
  if (sort.value.field !== field) {
    return '';
  }
  return sort.value.direction === 'asc' ? '↑' : '↓';
}

function openEdit(task: Task): void {
  emit('edit', task);
}

function handleDelete(task: Task): void {
  openDeleteConfirm(task, props.manager);
}
</script>

<template>
  <div class="list-view">
    <div class="list-view__toolbar">
      <span class="meta-label list-view__count">
        {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
      </span>

      <div class="list-view__sort-controls">
        <button
          type="button"
          class="list-view__sort-btn"
          :class="{ 'list-view__sort-btn--active': sort.field === 'dueDate' }"
          @click="toggleSort('dueDate')"
        >
          Due date
          <span
            v-if="sort.field === 'dueDate'"
            class="list-view__sort-indicator"
          >{{ sortIndicator('dueDate') }}</span>
        </button>
        <button
          type="button"
          class="list-view__sort-btn"
          :class="{ 'list-view__sort-btn--active': sort.field === 'priority' }"
          @click="toggleSort('priority')"
        >
          Priority
          <span
            v-if="sort.field === 'priority'"
            class="list-view__sort-indicator"
          >{{ sortIndicator('priority') }}</span>
        </button>
      </div>
    </div>

    <div
      v-if="tasks.length === 0"
      class="list-view__empty"
    >
        <p class="card-title list-view__empty-title">No tasks found</p>
      <p class="meta-label list-view__empty-text">
        Adjust your filters or create a new task.
      </p>
    </div>

    <div
      v-else
      class="list-view__table"
      role="table"
    >
      <div
        class="list-view__row list-view__row--header"
        role="row"
      >
        <div
          class="list-view__cell list-view__cell--title"
          role="columnheader"
        >
          Title
        </div>
        <div
          class="list-view__cell"
          role="columnheader"
        >
          Status
        </div>
        <div
          class="list-view__cell list-view__cell--sortable"
          role="columnheader"
        >
          <button
            type="button"
            class="list-view__header-btn"
            @click="toggleSort('priority')"
          >
            Priority
            <span class="list-view__sort-indicator">{{ sortIndicator('priority') }}</span>
          </button>
        </div>
        <div
          class="list-view__cell list-view__cell--sortable"
          role="columnheader"
        >
          <button
            type="button"
            class="list-view__header-btn"
            @click="toggleSort('dueDate')"
          >
            Due date
            <span class="list-view__sort-indicator">{{ sortIndicator('dueDate') }}</span>
          </button>
        </div>
        <div
          class="list-view__cell"
          role="columnheader"
        >
          Assignee
        </div>
        <div
          class="list-view__cell list-view__cell--tags"
          role="columnheader"
        >
          Tags
        </div>
        <div
          class="list-view__cell list-view__cell--actions"
          role="columnheader"
        >
          Actions
        </div>
      </div>

      <div
        v-for="task in tasks"
        :key="task.id"
        class="list-view__row"
        role="row"
      >
        <div
          class="list-view__cell list-view__cell--title"
          role="cell"
        >
          <button
            type="button"
            class="card-title list-view__title-btn"
            @click="openEdit(task)"
          >
            {{ task.title }}
          </button>
          <p class="card-body list-view__description">
            {{ task.description }}
          </p>
        </div>

        <div
          class="list-view__cell"
          role="cell"
        >
          <span
            class="chip list-view__status"
            :style="statusBadgeStyle(task)"
          >
            {{ statusLabel(task) }}
          </span>
        </div>

        <div
          class="list-view__cell"
          role="cell"
        >
          <span
            class="chip list-view__priority"
            :style="priorityBadgeStyle(task)"
          >
            {{ priorityLabel(task) }}
          </span>
        </div>

        <div
          class="list-view__cell"
          role="cell"
        >
          <span
            class="meta-label list-view__due-date"
            :class="{ 'text-overdue': manager.isOverdue(task) }"
          >
            <svg
              v-if="manager.isOverdue(task)"
              class="list-view__overdue-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M12 9v4M12 17h.01"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
            {{ manager.formatDueDate(task.dueDate) }}
          </span>
        </div>

        <div
          class="list-view__cell list-view__cell--assignee"
          role="cell"
        >
          <AssigneeAvatar
            :assignee="task.assignee"
            size="sm"
          />
          <span class="meta-label list-view__assignee-name">
            {{ task.assignee || 'Unassigned' }}
          </span>
        </div>

        <div
          class="list-view__cell list-view__cell--tags"
          role="cell"
        >
          <span
            v-for="tag in task.tags"
            :key="tag"
            class="chip list-view__tag"
          >
            {{ tag }}
          </span>
          <span
            v-if="!task.tags.length"
            class="meta-label list-view__no-tags"
          >—</span>
        </div>

        <div
          class="list-view__cell list-view__cell--actions"
          role="cell"
        >
          <button
            type="button"
            class="list-view__action-btn"
            aria-label="Edit task"
            @click="openEdit(task)"
          >
            Edit
          </button>
          <button
            type="button"
            class="list-view__action-btn list-view__action-btn--delete"
            aria-label="Delete task"
            @click="handleDelete(task)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.list-view__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.list-view__count {
  color: #6b7280;
}

.list-view__sort-controls {
  display: flex;
  gap: var(--space-2);
}

.list-view__sort-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-3);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  color: #374151;
  font-size: var(--font-size-card-body);
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.list-view__sort-btn:hover {
  border-color: #d1d5db;
  background-color: #f9fafb;
}

.list-view__sort-btn--active {
  border-color: #93c5fd;
  background-color: #eff6ff;
  color: #1d4ed8;
}

.list-view__sort-indicator {
  font-size: var(--font-size-badge);
  line-height: 1;
}

.list-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-6);
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background-color: #f9fafb;
  text-align: center;
}

.list-view__empty-title {
  margin: 0;
  color: #374151;
}

.list-view__empty-text {
  margin: 0;
  color: #9ca3af;
}

.list-view__table {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  background: #ffffff;
}

.list-view__row {
  display: grid;
  grid-template-columns: minmax(200px, 2fr) 110px 100px 120px 150px 140px 120px;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid #f3f4f6;
  min-width: 960px;
}

.list-view__row:last-child {
  border-bottom: none;
}

.list-view__row--header {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.list-view__row--header .list-view__cell {
  font-size: var(--font-size-column-heading);
  font-weight: var(--font-weight-column-heading);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.list-view__cell {
  min-width: 0;
}

.list-view__cell--title {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.list-view__cell--tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.list-view__cell--actions {
  display: flex;
  gap: var(--space-1);
}

.list-view__header-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  color: inherit;
  text-transform: inherit;
  letter-spacing: inherit;
  cursor: pointer;
}

.list-view__header-btn:hover {
  color: #111827;
}

.list-view__title-btn {
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  color: #111827;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-view__title-btn:hover {
  color: #2563eb;
}

.list-view__description {
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-view__status {
  padding: var(--space-1) var(--space-2);
  border-radius: 6px;
}

.list-view__priority {
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
}

.list-view__due-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.list-view__overdue-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-overdue);
}

.list-view__cell--assignee {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.list-view__assignee-name {
  vertical-align: middle;
}

.list-view__tag {
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
  background-color: #f3f4f6;
  color: #4b5563;
}

.list-view__no-tags {
  color: #d1d5db;
}

.list-view__action-btn {
  padding: var(--space-1) var(--space-2);
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #ffffff;
  color: #374151;
  font-size: var(--font-size-badge);
  font-weight: 600;
  cursor: pointer;
}

.list-view__action-btn:hover {
  background-color: #f9fafb;
}

.list-view__action-btn--delete:hover {
  border-color: #fecaca;
  background-color: #fef2f2;
  color: var(--color-priority-high);
}
</style>
