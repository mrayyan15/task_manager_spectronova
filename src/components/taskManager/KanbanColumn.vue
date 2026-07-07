<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Task, TaskStatus } from '../../BLL/taskManager/types';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import { openDesignOnlyNotice } from '../../utils/designOnlyNotice';
import TaskCard from './TaskCard.vue';

const props = defineProps<{
  manager: TaskManager;
  status: TaskStatus;
}>();

const emit = defineEmits<{
  edit: [task: Task];
  'add-task': [status: TaskStatus];
}>();

const isDragOver = ref(false);

const columnMeta = computed(() => {
  const configured = props.manager.state.columns.find(
    (column) => column.id === props.status,
  );
  if (configured) {
    return {
      title: configured.title,
      dotColor: configured.dotColor,
    };
  }
  return {
    title: props.status,
    dotColor: '#9ca3af',
  };
});

const tasks = computed(() => props.manager.getTasksByStatus(props.status));

const isEmpty = computed(() => tasks.value.length === 0);

const emptyState = computed(() => {
  const states: Record<
    string,
    { title: string; text: string; accent: string; fill: string }
  > = {
    todo: {
      title: 'Nothing queued yet',
      text: 'Add a task to get started in this column.',
      accent: '#4f46e5',
      fill: '#eef2ff',
    },
    'in-progress': {
      title: 'No work in flight',
      text: 'Drag a task here when you begin working on it.',
      accent: '#f59e0b',
      fill: '#fff7ed',
    },
    done: {
      title: 'No completed tasks',
      text: 'Finished tasks will appear here once marked complete.',
      accent: '#22c55e',
      fill: '#f0fdf4',
    },
  };
  return (
    states[props.status] ?? {
      title: 'No tasks here',
      text: 'Drag a task into this column or create a new one.',
      accent: '#3b82f6',
      fill: '#dbeafe',
    }
  );
});

function onDragStart(event: DragEvent, taskId: string): void {
  event.dataTransfer?.setData('text/plain', taskId);
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
  }
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
  isDragOver.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function onDragLeave(): void {
  isDragOver.value = false;
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  isDragOver.value = false;

  const taskId = event.dataTransfer?.getData('text/plain');
  if (!taskId) {
    return;
  }

  props.manager.moveTo(taskId, props.status);
}

function requestAddTask(): void {
  emit('add-task', props.status);
}

function showColumnOptions(): void {
  openDesignOnlyNotice('Column options');
}
</script>

<template>
  <section
    class="kanban-column"
    :class="{ 'kanban-column--drag-over': isDragOver }"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <header class="kanban-column__header">
      <div class="kanban-column__heading">
        <span
          class="kanban-column__dot"
          :style="{ backgroundColor: columnMeta.dotColor }"
        />
        <h2 class="column-heading kanban-column__title">
          {{ columnMeta.title }}
        </h2>
        <span class="badge kanban-column__count">{{ tasks.length }}</span>
      </div>

      <div class="kanban-column__actions">
        <button
          type="button"
          class="kanban-column__icon-btn"
          aria-label="Add task to column"
          @click="requestAddTask"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M8 3v10M3 8h10"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="kanban-column__icon-btn"
          aria-label="Column options"
          @click="showColumnOptions"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="3" cy="8" r="1.25" fill="currentColor" />
            <circle cx="8" cy="8" r="1.25" fill="currentColor" />
            <circle cx="13" cy="8" r="1.25" fill="currentColor" />
          </svg>
        </button>
      </div>
    </header>

    <div class="kanban-column__body">
      <div
        v-if="isEmpty"
        class="kanban-column__empty"
      >
        <svg
          class="kanban-column__empty-icon"
          viewBox="0 0 120 100"
          aria-hidden="true"
        >
          <rect
            x="8"
            y="12"
            width="104"
            height="76"
            rx="10"
            :fill="emptyState.fill"
            stroke="#e5e7eb"
            stroke-width="2"
          />
          <rect
            x="20"
            y="28"
            width="56"
            height="8"
            rx="4"
            fill="#d1d5db"
          />
          <rect
            x="20"
            y="44"
            width="80"
            height="6"
            rx="3"
            fill="#e5e7eb"
          />
          <rect
            x="20"
            y="56"
            width="72"
            height="6"
            rx="3"
            fill="#e5e7eb"
          />
          <circle
            cx="88"
            cy="68"
            r="14"
            :fill="emptyState.fill"
            :stroke="emptyState.accent"
            stroke-width="2"
          />
          <path
            v-if="status === 'done'"
            d="M83 68l3.5 3.5L93 64"
            :stroke="emptyState.accent"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else-if="status === 'in-progress'"
            d="M84 64v8M80 68h8"
            :stroke="emptyState.accent"
            stroke-width="2"
            stroke-linecap="round"
          />
          <path
            v-else
            d="M84 68h8M88 64v8"
            :stroke="emptyState.accent"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <p class="card-title kanban-column__empty-title">{{ emptyState.title }}</p>
        <p class="meta-label kanban-column__empty-text">
          {{ emptyState.text }}
        </p>
      </div>

      <TransitionGroup
        v-else
        name="card-list"
        tag="div"
        class="kanban-column__cards"
      >
        <div
          v-for="task in tasks"
          :key="task.id"
          class="kanban-column__card-wrapper"
          draggable="true"
          @dragstart="onDragStart($event, task.id)"
        >
          <TaskCard
            :task="task"
            :manager="manager"
            @edit="emit('edit', $event)"
          />
        </div>
      </TransitionGroup>
    </div>
  </section>
</template>

<style scoped>
.kanban-column {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-width: 0;
  min-height: 480px;
  background-color: var(--color-column-bg);
  border-radius: 12px;
  border: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.kanban-column--drag-over {
  border-color: #93c5fd;
  background-color: #eff6ff;
}

.kanban-column__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-4) var(--space-3);
}

.kanban-column__heading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
}

.kanban-column__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.kanban-column__title {
  color: #474d66;
}

.kanban-column__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--column-count-size);
  height: var(--column-count-size);
  padding: 0;
  border-radius: 50%;
  background-color: var(--column-count-bg);
  color: var(--column-count-text);
  font-size: var(--font-size-column-count);
  font-weight: var(--font-weight-badge);
  line-height: 1;
  flex-shrink: 0;
}

.kanban-column__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.kanban-column__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.kanban-column__icon-btn svg {
  width: 16px;
  height: 16px;
}

.kanban-column__icon-btn:hover {
  background-color: rgba(255, 255, 255, 0.8);
  color: var(--color-text-secondary);
}

.kanban-column__body {
  flex: 1;
  padding: 0 var(--space-3) var(--space-3);
  min-height: 0;
}

.kanban-column__cards {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  position: relative;
}

.kanban-column__card-wrapper {
  cursor: grab;
}

.kanban-column__card-wrapper:active {
  cursor: grabbing;
}

.kanban-column__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 220px;
  padding: var(--space-6) var(--space-4);
  text-align: center;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.6);
}

.kanban-column__empty-icon {
  width: 96px;
  height: 80px;
}

.kanban-column__empty-title {
  margin: 0;
  color: #374151;
}

.kanban-column__empty-text {
  margin: 0;
  color: var(--color-text-muted);
  max-width: 220px;
}

.card-list-move,
.card-list-enter-active,
.card-list-leave-active {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.card-list-enter-from,
.card-list-leave-to {
  opacity: 0;
  transform: translateY(var(--space-3));
}

.card-list-leave-active {
  position: absolute;
  left: 0;
  right: 0;
}
</style>
