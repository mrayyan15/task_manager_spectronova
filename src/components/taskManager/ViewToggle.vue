<script setup lang="ts">
import { computed } from 'vue';
import { TaskManager } from '../../BLL/taskManager/TaskManager';

const props = defineProps<{
  manager: TaskManager;
}>();

type ViewMode = 'kanban' | 'list';

const activeView = computed(() => props.manager.state.activeView);

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'kanban', label: 'Board' },
  { id: 'list', label: 'List' },
];

function selectView(view: ViewMode): void {
  if (activeView.value !== view) {
    props.manager.toggleView(view);
  }
}
</script>

<template>
  <div
    class="view-toggle"
    role="tablist"
    aria-label="Task view"
  >
    <button
      v-for="view in VIEWS"
      :key="view.id"
      type="button"
      class="view-toggle__btn"
      :class="{ 'view-toggle__btn--active': activeView === view.id }"
      role="tab"
      :aria-selected="activeView === view.id"
      @click="selectView(view.id)"
    >
      <svg
        v-if="view.id === 'kanban'"
        class="view-toggle__icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="3"
          width="3"
          height="10"
          rx="0.75"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
        />
        <rect
          x="6.5"
          y="3"
          width="3"
          height="6.5"
          rx="0.75"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
        />
        <rect
          x="11"
          y="3"
          width="3"
          height="8.5"
          rx="0.75"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
        />
      </svg>
      <svg
        v-else
        class="view-toggle__icon"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <rect
          x="2"
          y="3.25"
          width="1.75"
          height="1.75"
          rx="0.35"
          fill="currentColor"
        />
        <path
          d="M5.5 4.125h7.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
        />
        <rect
          x="2"
          y="7.125"
          width="1.75"
          height="1.75"
          rx="0.35"
          fill="currentColor"
        />
        <path
          d="M5.5 8h7.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
        />
        <rect
          x="2"
          y="11"
          width="1.75"
          height="1.75"
          rx="0.35"
          fill="currentColor"
        />
        <path
          d="M5.5 11.875h5.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.25"
          stroke-linecap="round"
        />
      </svg>
      {{ view.label }}
    </button>
  </div>
</template>

<style scoped>
.view-toggle {
  display: inline-flex;
  align-items: flex-end;
}

.view-toggle__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-card-body);
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  position: relative;
  z-index: 0;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.view-toggle__icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.view-toggle__btn:hover {
  color: var(--color-text);
}

.view-toggle__btn--active {
  color: var(--color-primary);
  font-weight: 600;
  border-bottom-color: var(--color-primary);
  z-index: 1;
}
</style>
