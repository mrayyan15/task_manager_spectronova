<script setup lang="ts">
import { computed, ref } from 'vue';
import type { Task, TaskStatus } from '../../BLL/taskManager/types';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import AddColumnModal from './AddColumnModal.vue';
import KanbanColumn from './KanbanColumn.vue';

const props = defineProps<{
  manager: TaskManager;
}>();

const emit = defineEmits<{
  edit: [task: Task];
  'add-task': [status: TaskStatus];
}>();

const columns = computed(() => props.manager.state.columns);
const isAddColumnOpen = ref(false);

function onAddTask(status: TaskStatus): void {
  emit('add-task', status);
}

function onAddColumn(): void {
  isAddColumnOpen.value = true;
}

function closeAddColumn(): void {
  isAddColumnOpen.value = false;
}

function confirmAddColumn(title: string): void {
  props.manager.addColumn(title);
  isAddColumnOpen.value = false;
}
</script>

<template>
  <div class="kanban-board-scroll">
    <div class="kanban-board">
      <KanbanColumn
        v-for="column in columns"
        :key="column.id"
        :manager="manager"
        :status="column.id"
        @edit="emit('edit', $event)"
        @add-task="onAddTask"
      />

      <button
        type="button"
        class="kanban-board__add-column"
        aria-label="Add column"
        @click="onAddColumn"
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
    </div>
  </div>

  <AddColumnModal
    :is-open="isAddColumnOpen"
    @close="closeAddColumn"
    @confirm="confirmAddColumn"
  />
</template>

<style scoped>
.kanban-board-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  background-color: var(--color-board-bg);
  border-radius: 12px;
  padding: var(--space-4);
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.kanban-board-scroll::-webkit-scrollbar {
  height: 4px;
}

.kanban-board-scroll::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 999px;
}

.kanban-board {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  gap: var(--space-4);
  width: 100%;
  min-width: min-content;
}

.kanban-board__add-column {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  margin-top: var(--space-1);
  padding: 0;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.7);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background-color 0.15s ease;
}

.kanban-board__add-column svg {
  width: 20px;
  height: 20px;
}

.kanban-board__add-column:hover {
  border-color: #c4b5fd;
  background-color: #ffffff;
  color: var(--color-primary);
}
</style>
