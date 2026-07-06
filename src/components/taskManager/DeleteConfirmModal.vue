<script setup lang="ts">
import { computed } from 'vue';
import {
  closeDeleteConfirm,
  confirmDeleteTask,
  deleteConfirmOpen,
  deleteConfirmTask,
} from '../../utils/deleteConfirm';

const taskTitle = computed(() => deleteConfirmTask.value?.title ?? 'this task');

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    closeDeleteConfirm();
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="deleteConfirmOpen"
      class="delete-confirm__overlay"
      role="presentation"
      @click="onOverlayClick"
    >
      <div
        class="delete-confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
      >
        <h2
          id="delete-confirm-title"
          class="delete-confirm__title"
        >
          Delete task?
        </h2>

        <p
          id="delete-confirm-description"
          class="delete-confirm__message"
        >
          Delete <strong>"{{ taskTitle }}"</strong>? This action cannot be undone.
        </p>

        <div class="delete-confirm__actions">
          <button
            type="button"
            class="delete-confirm__btn delete-confirm__btn--secondary"
            @click="closeDeleteConfirm"
          >
            Cancel
          </button>
          <button
            type="button"
            class="delete-confirm__btn delete-confirm__btn--danger"
            @click="confirmDeleteTask"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.delete-confirm__overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.delete-confirm {
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.delete-confirm__title {
  margin: 0 0 12px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.delete-confirm__message {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.55;
  color: #4b5563;
}

.delete-confirm__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.delete-confirm__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.delete-confirm__btn--secondary {
  background: #f3f4f6;
  color: #374151;
}

.delete-confirm__btn--secondary:hover {
  background: #e5e7eb;
}

.delete-confirm__btn--danger {
  background: #dc2626;
  color: #ffffff;
}

.delete-confirm__btn--danger:hover {
  background: #b91c1c;
}
</style>
