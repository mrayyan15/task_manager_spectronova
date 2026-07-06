<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  close: [];
  confirm: [title: string];
}>();

const name = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const trimmedName = computed(() => name.value.trim());
const canSubmit = computed(() => trimmedName.value.length > 0);

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) {
      return;
    }
    name.value = '';
    await nextTick();
    inputRef.value?.focus();
  },
);

function onOverlayClick(event: MouseEvent): void {
  if (event.target === event.currentTarget) {
    emit('close');
  }
}

function submit(): void {
  if (!canSubmit.value) {
    return;
  }
  emit('confirm', trimmedName.value);
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    submit();
  }
  if (event.key === 'Escape') {
    emit('close');
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="add-column__overlay"
      role="presentation"
      @click="onOverlayClick"
    >
      <div
        class="add-column"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-column-title"
        @keydown="onKeydown"
      >
        <h2
          id="add-column-title"
          class="add-column__title"
        >
          Add column
        </h2>

        <label
          class="add-column__label"
          for="add-column-name"
        >
          Column name
        </label>
        <input
          id="add-column-name"
          ref="inputRef"
          v-model="name"
          type="text"
          class="add-column__input"
          placeholder="e.g. Review, Backlog"
          maxlength="48"
          @keydown.enter.prevent="submit"
        />

        <div class="add-column__actions">
          <button
            type="button"
            class="add-column__btn add-column__btn--secondary"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="add-column__btn add-column__btn--primary"
            :disabled="!canSubmit"
            @click="submit"
          >
            Add column
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.add-column__overlay {
  position: fixed;
  inset: 0;
  z-index: 1100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(15, 23, 42, 0.45);
}

.add-column {
  width: min(100%, 420px);
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
}

.add-column__title {
  margin: 0 0 16px;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

.add-column__label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.add-column__input {
  width: 100%;
  margin-bottom: 20px;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.add-column__input::placeholder {
  color: #9ca3af;
}

.add-column__input:focus {
  border-color: #a78bfa;
  box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.25);
}

.add-column__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.add-column__btn {
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

.add-column__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.add-column__btn--secondary {
  background: #f3f4f6;
  color: #374151;
}

.add-column__btn--secondary:hover {
  background: #e5e7eb;
}

.add-column__btn--primary {
  background: var(--color-primary, #7c3aed);
  color: #ffffff;
}

.add-column__btn--primary:hover:not(:disabled) {
  background: #6d28d9;
}
</style>
