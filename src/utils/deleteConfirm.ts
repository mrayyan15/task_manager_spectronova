import { ref } from 'vue';
import type { Task } from '../BLL/taskManager/types';
import type { TaskManager } from '../BLL/taskManager/TaskManager';

export const deleteConfirmOpen = ref(false);
export const deleteConfirmTask = ref<Task | null>(null);

let pendingManager: TaskManager | null = null;

export function openDeleteConfirm(task: Task, manager: TaskManager): void {
  deleteConfirmTask.value = task;
  pendingManager = manager;
  deleteConfirmOpen.value = true;
}

export function confirmDeleteTask(): void {
  const task = deleteConfirmTask.value;
  if (task && pendingManager) {
    pendingManager.deleteTask(task.id);
  }
  closeDeleteConfirm();
}

export function closeDeleteConfirm(): void {
  deleteConfirmOpen.value = false;
  deleteConfirmTask.value = null;
  pendingManager = null;
}
