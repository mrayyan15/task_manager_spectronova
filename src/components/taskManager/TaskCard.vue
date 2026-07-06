<script setup lang="ts">
import { computed } from 'vue';
import type { Task } from '../../BLL/taskManager/types';
import { parseAssigneeNames } from '../../BLL/taskManager/types';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import { getAssigneeAvatarColor } from '../../utils/colors';
import { openDesignOnlyNotice } from '../../utils/designOnlyNotice';
import { openDeleteConfirm } from '../../utils/deleteConfirm';
import { getAssigneeInitials } from '../../utils/initials';

const props = defineProps<{
  task: Task;
  manager: TaskManager;
}>();

const emit = defineEmits<{
  edit: [task: Task];
}>();

const statusMeta = computed(() => props.manager.getStatusBadgeMeta(props.task.status));
const priorityMeta = computed(() =>
  props.manager.getPriorityBadgeMeta(props.task.priority),
);

const assigneeList = computed(() => parseAssigneeNames(props.task.assignee));

const formattedDueDate = computed(() => props.manager.formatDueDate(props.task.dueDate));

const isOverdue = computed(() => props.manager.isOverdue(props.task));

const cardStats = computed(() => {
  let hash = 0;
  for (let i = 0; i < props.task.id.length; i++) {
    hash = props.task.id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const abs = Math.abs(hash);
  const subtasksTotal = (abs % 4) + 2;
  const subtasksDone = abs % (subtasksTotal + 1);
  return {
    comments: (abs % 14) + 1,
    links: abs % 3,
    subtasksDone,
    subtasksTotal,
  };
});

function assigneeInitialsColor(name: string): string {
  return getAssigneeAvatarColor(name);
}

function showDesignOnly(feature: string): void {
  openDesignOnlyNotice(feature);
}

function openEdit(): void {
  emit('edit', props.task);
}

function handleDelete(): void {
  openDeleteConfirm(props.task, props.manager);
}
</script>

<template>
  <article class="task-card">
    <header class="task-card__header">
      <span
        class="chip task-card__status"
        :style="{
          color: statusMeta.textColor,
          backgroundColor: statusMeta.backgroundColor,
        }"
      >
        <span
          class="task-card__status-dot"
          :style="{ backgroundColor: statusMeta.dotColor }"
        />
        {{ statusMeta.label }}
      </span>

      <div class="task-card__actions">
        <button
          type="button"
          class="task-card__icon-btn"
          aria-label="Edit task"
          @click="openEdit"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="3" cy="8" r="1.25" fill="currentColor" />
            <circle cx="8" cy="8" r="1.25" fill="currentColor" />
            <circle cx="13" cy="8" r="1.25" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          class="task-card__icon-btn task-card__icon-btn--delete"
          aria-label="Delete task"
          @click="handleDelete"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M5.5 2h5l.5 1H14v1H2V3h3.5l.5-1zm1 4h1v6h-1V6zm3 0h1v6h-1V6zM4 4h8l-.7 9.1c-.1.9-.9 1.6-1.8 1.6H6.5c-.9 0-1.7-.7-1.8-1.6L4 4z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </header>

    <button
      type="button"
      class="task-card__content-btn"
      @click="openEdit"
    >
      <h3 class="card-title task-card__title">
        {{ task.title }}
      </h3>
      <p class="card-body task-card__description">
        {{ task.description }}
      </p>

      <div
        v-if="task.tags.length"
        class="task-card__tags"
      >
        <span
          v-for="tag in task.tags"
          :key="tag"
          class="chip task-card__tag"
        >
          {{ tag }}
        </span>
      </div>
    </button>

    <div class="task-card__assignees">
      <span class="meta-label task-card__assignees-label">Assignees:</span>
      <div class="task-card__assignees-avatars">
        <span
          v-for="name in assigneeList"
          :key="name"
          class="task-card__initials"
          :style="{ backgroundColor: assigneeInitialsColor(name) }"
          :title="name"
        >
          {{ getAssigneeInitials(name) }}
        </span>
      </div>
    </div>

    <div class="task-card__meta">
      <span
        class="meta-label task-card__due-date"
        :class="{ 'text-overdue': isOverdue }"
      >
        <svg
          v-if="isOverdue"
          class="task-card__overdue-icon"
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
        <svg
          v-else
          class="task-card__flag-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M4 22V15"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
          />
        </svg>
        {{ formattedDueDate }}
      </span>

      <span
        class="chip task-card__priority"
        :style="{
          backgroundColor: priorityMeta.backgroundColor,
          color: priorityMeta.textColor,
        }"
      >
        {{ priorityMeta.label }}
      </span>
    </div>

    <footer class="task-card__footer">
      <button
        type="button"
        class="meta-label task-card__footer-item task-card__footer-btn"
        @click="showDesignOnly('Comments')"
      >
        <svg
          class="task-card__footer-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M14 9a2 2 0 0 1-2 2H4l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ cardStats.comments }} Comments
      </button>
      <button
        type="button"
        class="meta-label task-card__footer-item task-card__footer-btn"
        @click="showDesignOnly('Links')"
      >
        <svg
          class="task-card__footer-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M13.19 8.688a4.5 4.5 0 0 1 0 6.324l-4.773 4.773a4.5 4.5 0 0 1-6.364-6.364l1.157-1.157"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M10.81 15.312a4.5 4.5 0 0 1 0-6.324l4.773-4.773a4.5 4.5 0 0 1 6.364 6.364l-1.157 1.157"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ cardStats.links }} Links
      </button>
      <button
        type="button"
        class="meta-label task-card__footer-item task-card__footer-btn"
        @click="showDesignOnly('Subtasks')"
      >
        <svg
          class="task-card__footer-icon"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M14 2v4a2 2 0 0 0 2 2h4"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        {{ cardStats.subtasksDone }}/{{ cardStats.subtasksTotal }}
      </button>
    </footer>
  </article>
</template>

<style scoped>
.task-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.05);
  transition: box-shadow 0.15s ease;
}

.task-card:hover {
  box-shadow: 0 2px 8px rgba(16, 24, 40, 0.08);
}

.task-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: 24px;
}

.task-card__status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: 6px;
  line-height: 1.3;
  letter-spacing: 0.01em;
}

.task-card__status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.task-card__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease, opacity 0.15s ease;
}

.task-card__icon-btn svg {
  width: 16px;
  height: 16px;
}

.task-card__icon-btn:hover {
  color: #6b7280;
  background-color: #f3f4f6;
}

.task-card__icon-btn--delete {
  opacity: 0;
  pointer-events: none;
}

.task-card:hover .task-card__icon-btn--delete {
  opacity: 1;
  pointer-events: auto;
}

.task-card__icon-btn--delete:hover {
  color: var(--color-priority-high);
  background-color: #fef2f2;
}

.task-card__content-btn {
  display: block;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.task-card__title {
  color: #111827;
  letter-spacing: -0.01em;
}

.task-card__description {
  margin-top: var(--space-1);
  color: var(--color-text-muted);
}

.task-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.task-card__tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  border-radius: 999px;
  background-color: #f3f4f6;
  color: #4b5563;
}

.task-card__assignees {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.task-card__assignees-label {
  flex-shrink: 0;
}

.task-card__assignees-avatars {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
}

.task-card__stack-avatar {
  margin-left: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.task-card__initials {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: -6px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}

.task-card__initials:first-child {
  margin-left: 0;
}

.task-card__stack-avatar:first-child {
  margin-left: 0;
}

.task-card__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
}

.task-card__due-date {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.task-card__flag-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.task-card__overdue-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: var(--color-overdue);
}

.task-card__footer-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.task-card__priority {
  padding: var(--space-1) var(--space-3);
  border-radius: 999px;
  text-transform: capitalize;
  flex-shrink: 0;
}

.task-card__footer {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-top: var(--space-3);
  margin-top: var(--space-1);
  border-top: 1px solid #f0f1f3;
}

.task-card__footer-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  line-height: 1.3;
  white-space: nowrap;
}

.task-card__footer-btn {
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.task-card__footer-btn:hover {
  color: #6b7280;
}
</style>
