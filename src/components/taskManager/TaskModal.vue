<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue';
import type { TaskPriority, TaskStatus, TaskModalMode } from '../../BLL/taskManager/types';
import { formatAssigneeNames, isEditModalMode, parseAssigneeNames } from '../../BLL/taskManager/types';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import { STATUS_BADGE_COLORS } from '../../utils/badgeColors';
import AssigneeAvatar from './AssigneeAvatar.vue';
import TaskModalMetaIcon from './TaskModalMetaIcon.vue';

const props = defineProps<{
  manager: TaskManager;
  modalMode: TaskModalMode;
}>();

const emit = defineEmits<{
  close: [];
}>();

const STATUS_CARD_LABELS: Record<string, string> = {
  todo: STATUS_BADGE_COLORS.todo.label,
  'in-progress': STATUS_BADGE_COLORS['in-progress'].label,
  done: STATUS_BADGE_COLORS.done.label,
};

const statusOptions = computed(() =>
  props.manager.state.columns.map((column) => ({
    value: column.id,
    label: STATUS_CARD_LABELS[column.id] ?? column.title,
    dotColor: column.dotColor,
  })),
);

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const title = ref('');
const status = ref<TaskStatus>('todo');
const priority = ref<TaskPriority>('medium');
const dueDate = ref('');
const selectedAssignees = ref<string[]>([]);
const tagsInput = ref('');
const description = ref('');
const showErrors = ref(false);
const dueDateInputRef = ref<HTMLInputElement | null>(null);
const tagsInputRef = ref<HTMLInputElement | null>(null);
const isEditingTags = ref(false);
const isAssigneeMenuOpen = ref(false);
const isStatusMenuOpen = ref(false);
const isPriorityMenuOpen = ref(false);
const statusMenuRef = ref<HTMLElement | null>(null);
const priorityMenuRef = ref<HTMLElement | null>(null);
const assigneeMenuRef = ref<HTMLElement | null>(null);

const assigneeOptions = computed(() => props.manager.getAssignees());

const isOpen = computed(() => props.modalMode.kind !== 'closed');

const isEditing = computed(() => isEditModalMode(props.modalMode));

const modalHeading = computed(() =>
  isEditing.value ? 'Edit Task' : 'Create Task',
);

const formattedCreatedAt = computed(() => {
  const date =
    isEditModalMode(props.modalMode)
      ? new Date(props.modalMode.task.createdAt)
      : new Date();
  const datePart = date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${datePart} ${timePart}`;
});

const parsedTags = computed(() => parseTags(tagsInput.value));

const statusLabel = computed(() => {
  const option = statusOptions.value.find((item) => item.value === status.value);
  return option?.label ?? status.value;
});

const priorityLabel = computed(() => {
  const option = PRIORITY_OPTIONS.find((item) => item.value === priority.value);
  return option?.label ?? priority.value;
});

const statusBadgeClass = computed(() => {
  const map: Record<string, string> = {
    todo: 'task-modal__value-badge--status-todo',
    'in-progress': 'task-modal__value-badge--status-progress',
    done: 'task-modal__value-badge--status-done',
  };
  return map[status.value] ?? 'task-modal__value-badge--status-todo';
});

const priorityBadgeClass = computed(
  () => `task-modal__value-badge--priority-${priority.value}`,
);

const formattedDueDateDisplay = computed(() => {
  if (!dueDate.value) {
    return 'Select due date';
  }
  const date = new Date(`${dueDate.value}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
});

const assigneeList = computed(() => selectedAssignees.value);

const titleError = computed(() => {
  if (!showErrors.value) {
    return '';
  }
  if (!title.value.trim()) {
    return 'Title is required.';
  }
  return '';
});

const dueDateError = computed(() => {
  if (!showErrors.value) {
    return '';
  }
  if (!dueDate.value) {
    return 'Due date is required.';
  }
  if (isDueDateInPast(dueDate.value)) {
    return 'Due date cannot be in the past.';
  }
  return '';
});

const isFormValid = computed(
  () =>
    title.value.trim() !== '' &&
    dueDate.value !== '' &&
    !isDueDateInPast(dueDate.value),
);

const activityItems = computed(() => {
  const taskTitle = title.value.trim() || 'Design Homepage Wireframe';
  return [
    {
      day: 'Today',
      items: [
        {
          actor: 'Talan Korsgaard',
          action: 'changed the status of',
          subject: `"${taskTitle}"`,
          detail: 'from To Do to In Progress',
          time: '10:45 AM',
        },
        {
          actor: 'Hanna Philip',
          action: 'added reaction',
          subject: '🚀',
          detail: `in ${taskTitle}`,
          time: '10:46 AM',
        },
        {
          actor: 'Davis Donin',
          action: 'added a comment in',
          subject: taskTitle,
          detail: '',
          time: '10:50 AM',
        },
        {
          actor: 'Davis Donin',
          action: 'Uploaded file',
          subject: 'User flow',
          detail: '',
          time: '10:52 AM',
          attachment: true,
        },
      ],
    },
    {
      day: 'Yesterday',
      items: [
        {
          actor: 'Talan Korsgaard',
          action: 'created',
          subject: `"${taskTitle}"`,
          detail: '',
          time: '4:20 PM',
        },
      ],
    },
  ];
});

function openDueDatePicker(): void {
  const input = dueDateInputRef.value;
  if (!input) {
    return;
  }
  input.focus();
  if (typeof input.showPicker === 'function') {
    try {
      input.showPicker();
      return;
    } catch {
      // Fall through to click when showPicker is blocked by the browser.
    }
  }
  input.click();
}

async function openTagsEditor(): Promise<void> {
  isEditingTags.value = true;
  await nextTick();
  tagsInputRef.value?.focus();
  tagsInputRef.value?.select();
}

function closeTagsEditor(): void {
  isEditingTags.value = false;
  tagsInput.value = parseTags(tagsInput.value).join(', ');
}

function onTagsKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter') {
    event.preventDefault();
    closeTagsEditor();
  }
  if (event.key === 'Escape') {
    event.preventDefault();
    closeTagsEditor();
  }
}

function toggleAssigneeMenu(): void {
  isStatusMenuOpen.value = false;
  isPriorityMenuOpen.value = false;
  isAssigneeMenuOpen.value = !isAssigneeMenuOpen.value;
}

function isAssigneeSelected(name: string): boolean {
  return selectedAssignees.value.includes(name);
}

function toggleAssigneeSelection(name: string): void {
  if (isAssigneeSelected(name)) {
    selectedAssignees.value = selectedAssignees.value.filter((item) => item !== name);
    return;
  }
  selectedAssignees.value = [...selectedAssignees.value, name];
}

function closeMenus(): void {
  isStatusMenuOpen.value = false;
  isPriorityMenuOpen.value = false;
  isAssigneeMenuOpen.value = false;
}

function toggleStatusMenu(): void {
  isPriorityMenuOpen.value = false;
  isAssigneeMenuOpen.value = false;
  isStatusMenuOpen.value = !isStatusMenuOpen.value;
}

function togglePriorityMenu(): void {
  isStatusMenuOpen.value = false;
  isAssigneeMenuOpen.value = false;
  isPriorityMenuOpen.value = !isPriorityMenuOpen.value;
}

function selectStatus(value: TaskStatus): void {
  status.value = value;
  isStatusMenuOpen.value = false;
}

function selectPriority(value: TaskPriority): void {
  priority.value = value;
  isPriorityMenuOpen.value = false;
}

function onDocumentClick(event: MouseEvent): void {
  const target = event.target as Node;
  if (
    statusMenuRef.value?.contains(target) ||
    priorityMenuRef.value?.contains(target) ||
    assigneeMenuRef.value?.contains(target)
  ) {
    return;
  }
  closeMenus();
}

function isDueDateInPast(dateStr: string): boolean {
  return props.manager.isDueDateInPast(dateStr);
}

function resetForm(): void {
  if (isEditModalMode(props.modalMode)) {
    const task = props.modalMode.task;
    title.value = task.title;
    status.value = task.status;
    priority.value = task.priority;
    dueDate.value = task.dueDate;
    selectedAssignees.value = parseAssigneeNames(task.assignee);
    tagsInput.value = task.tags.join(', ');
    description.value = task.description;
  } else if (props.modalMode.kind === 'create') {
    title.value = '';
    status.value = props.modalMode.initialStatus;
    priority.value = 'medium';
    dueDate.value = '';
    selectedAssignees.value = [];
    tagsInput.value = '';
    description.value = '';
  }
  showErrors.value = false;
  isEditingTags.value = false;
  closeMenus();
}

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function closeModal(): void {
  emit('close');
}

function handleSubmit(): void {
  showErrors.value = true;
  if (!isFormValid.value) {
    return;
  }

  const payload = {
    title: title.value.trim(),
    description: description.value.trim(),
    priority: priority.value,
    dueDate: dueDate.value,
    assignee: formatAssigneeNames(selectedAssignees.value),
    status: status.value,
    tags: parseTags(tagsInput.value),
  };

  if (isEditModalMode(props.modalMode)) {
    props.manager.updateTask(props.modalMode.task.id, payload);
  } else if (props.modalMode.kind === 'create') {
    props.manager.addTask(payload);
  }

  emit('close');
}

function onOverlayClick(): void {
  closeModal();
}

watch(
  () => props.modalMode,
  (mode) => {
    if (mode.kind !== 'closed') {
      resetForm();
    } else {
      closeMenus();
    }
  },
);

watch([isStatusMenuOpen, isPriorityMenuOpen, isAssigneeMenuOpen], ([statusOpen, priorityOpen, assigneeOpen]) => {
  if (statusOpen || priorityOpen || assigneeOpen) {
    document.addEventListener('click', onDocumentClick);
  } else {
    document.removeEventListener('click', onDocumentClick);
  }
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="task-modal">
      <div
        v-if="isOpen"
        class="task-modal-overlay"
        @click="onOverlayClick"
      >
        <aside
          class="task-modal"
          role="dialog"
          aria-modal="true"
          :aria-label="modalHeading"
          @click.stop
        >
          <header class="task-modal__header">
            <button
              type="button"
              class="task-modal__icon-btn"
              aria-label="Close"
              @click="closeModal"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M18 6 6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                />
              </svg>
            </button>

            <div class="task-modal__header-actions">
              <button
                type="button"
                class="task-modal__icon-btn"
                aria-label="History"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M3 3v5h5M12 7v5l4 2"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="task-modal__icon-btn"
                aria-label="Favorite"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
                    stroke="currentColor"
                    stroke-width="1.75"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="task-modal__icon-btn"
                aria-label="More options"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="5"
                    r="1"
                    fill="currentColor"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="1"
                    fill="currentColor"
                  />
                  <circle
                    cx="12"
                    cy="19"
                    r="1"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </header>

          <form
            class="task-modal__form"
            @submit.prevent="handleSubmit"
          >
            <div class="task-modal__body">
            <div class="task-modal__title-block">
              <input
                v-model="title"
                type="text"
                class="page-title task-modal__title-input"
                placeholder="Task title"
                aria-label="Title"
              >
              <p
                v-if="titleError"
                class="task-modal__error"
              >
                {{ titleError }}
              </p>
            </div>

            <dl class="task-modal__meta">
              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="created-time" />
                  Created time
                </dt>
                <dd class="task-modal__meta-value task-modal__meta-value--plain">
                  {{ formattedCreatedAt }}
                </dd>
              </div>

              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="status" />
                  Status
                </dt>
                <dd class="task-modal__meta-value">
                  <div
                    ref="statusMenuRef"
                    class="task-modal__dropdown"
                  >
                    <button
                      type="button"
                      class="chip task-modal__value-badge task-modal__dropdown-trigger"
                      :class="statusBadgeClass"
                      aria-haspopup="listbox"
                      :aria-expanded="isStatusMenuOpen"
                      @click.stop="toggleStatusMenu"
                    >
                      <span class="task-modal__badge-dot" />
                      <span>{{ statusLabel }}</span>
                    </button>
                    <ul
                      v-if="isStatusMenuOpen"
                      class="task-modal__dropdown-menu"
                      role="listbox"
                      aria-label="Status options"
                    >
                      <li
                        v-for="option in statusOptions"
                        :key="option.value"
                        role="option"
                        :aria-selected="status === option.value"
                        class="task-modal__dropdown-item"
                        :class="{
                          'task-modal__dropdown-item--selected': status === option.value,
                        }"
                        @click.stop="selectStatus(option.value)"
                      >
                        {{ option.label }}
                      </li>
                    </ul>
                  </div>
                </dd>
              </div>

              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="priority" />
                  Priority
                </dt>
                <dd class="task-modal__meta-value">
                  <div
                    ref="priorityMenuRef"
                    class="task-modal__dropdown"
                  >
                    <button
                      type="button"
                      class="chip task-modal__value-badge task-modal__dropdown-trigger"
                      :class="priorityBadgeClass"
                      aria-haspopup="listbox"
                      :aria-expanded="isPriorityMenuOpen"
                      @click.stop="togglePriorityMenu"
                    >
                      <span>{{ priorityLabel }}</span>
                    </button>
                    <ul
                      v-if="isPriorityMenuOpen"
                      class="task-modal__dropdown-menu"
                      role="listbox"
                      aria-label="Priority options"
                    >
                      <li
                        v-for="option in PRIORITY_OPTIONS"
                        :key="option.value"
                        role="option"
                        :aria-selected="priority === option.value"
                        class="task-modal__dropdown-item"
                        :class="{
                          'task-modal__dropdown-item--selected': priority === option.value,
                        }"
                        @click.stop="selectPriority(option.value)"
                      >
                        {{ option.label }}
                      </li>
                    </ul>
                  </div>
                </dd>
              </div>

              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="due-date" />
                  Due Date
                </dt>
                <dd class="task-modal__meta-value task-modal__meta-value--stacked">
                  <label
                    class="task-modal__date-display"
                    @click="openDueDatePicker"
                  >
                    <span
                      class="task-modal__date-text"
                      :class="{ 'task-modal__date-text--placeholder': !dueDate }"
                    >
                      {{ formattedDueDateDisplay }}
                    </span>
                    <input
                      ref="dueDateInputRef"
                      v-model="dueDate"
                      type="date"
                      class="task-modal__date-input-overlay"
                      aria-label="Due date"
                      tabindex="-1"
                    >
                  </label>
                  <p
                    v-if="dueDateError"
                    class="task-modal__error"
                  >
                    {{ dueDateError }}
                  </p>
                </dd>
              </div>

              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="tags" />
                  Tags
                </dt>
                <dd class="task-modal__meta-value">
                  <button
                    v-if="!isEditingTags"
                    type="button"
                    class="task-modal__tag-chips task-modal__tag-chips--clickable"
                    @click="openTagsEditor"
                  >
                    <span
                      v-for="tag in parsedTags"
                      :key="tag"
                      class="chip task-modal__tag-chip"
                    >
                      {{ tag }}
                    </span>
                    <span
                      v-if="!parsedTags.length"
                      class="task-modal__tag-placeholder"
                    >
                      Add tags
                    </span>
                  </button>
                  <input
                    v-else
                    ref="tagsInputRef"
                    v-model="tagsInput"
                    type="text"
                    class="task-modal__tags-input"
                    placeholder="Task, Wireframe, Homepage"
                    aria-label="Tags"
                    @blur="closeTagsEditor"
                    @keydown="onTagsKeydown"
                  >
                </dd>
              </div>

              <div class="task-modal__meta-row">
                <dt class="meta-label task-modal__meta-label">
                  <TaskModalMetaIcon name="assignees" />
                  Assignees
                </dt>
                <dd class="task-modal__meta-value">
                  <div
                    ref="assigneeMenuRef"
                    class="task-modal__dropdown"
                  >
                    <button
                      type="button"
                      class="task-modal__avatar-stack task-modal__avatar-stack--clickable"
                      aria-haspopup="listbox"
                      :aria-expanded="isAssigneeMenuOpen"
                      @click.stop="toggleAssigneeMenu"
                    >
                      <template v-if="assigneeList.length">
                        <AssigneeAvatar
                          v-for="(name, index) in assigneeList"
                          :key="`${name}-${index}`"
                          :assignee="name"
                          size="sm"
                          class="task-modal__stack-avatar"
                        />
                      </template>
                      <span
                        v-else
                        class="task-modal__assignee-placeholder"
                      >
                        Add assignee
                      </span>
                    </button>
                    <ul
                      v-if="isAssigneeMenuOpen"
                      class="task-modal__dropdown-menu task-modal__assignee-menu"
                      role="listbox"
                      aria-label="Assignee options"
                      aria-multiselectable="true"
                    >
                      <li
                        v-for="person in assigneeOptions"
                        :key="person.id"
                        role="option"
                        :aria-selected="isAssigneeSelected(person.name)"
                        class="task-modal__dropdown-item task-modal__assignee-option"
                        :class="{
                          'task-modal__dropdown-item--selected': isAssigneeSelected(person.name),
                        }"
                        @click.stop="toggleAssigneeSelection(person.name)"
                      >
                        <AssigneeAvatar
                          :assignee="person.name"
                          size="sm"
                          class="task-modal__assignee-option-avatar"
                        />
                        <span>{{ person.name }}</span>
                      </li>
                    </ul>
                  </div>
                </dd>
              </div>
            </dl>

            <section class="task-modal__description">
              <h3 class="task-modal__description-title">
                Project Description
              </h3>
              <textarea
                v-model="description"
                class="card-body task-modal__description-input"
                rows="3"
                placeholder="Describe the task..."
                aria-label="Description"
              />
            </section>

            <section class="task-modal__tabs">
              <button
                type="button"
                class="task-modal__tab task-modal__tab--active"
              >
                Activity
              </button>
              <button
                type="button"
                class="task-modal__tab"
              >
                My Work
              </button>
              <button
                type="button"
                class="task-modal__tab"
              >
                Assigned
              </button>
              <button
                type="button"
                class="task-modal__tab"
              >
                Comments
              </button>
            </section>

            <section class="task-modal__activity">
              <div
                v-for="group in activityItems"
                :key="group.day"
                class="task-modal__activity-group"
              >
                <h4 class="task-modal__activity-day">
                  {{ group.day }}
                </h4>

                <div class="task-modal__activity-list">
                  <div
                    v-for="(entry, index) in group.items"
                    :key="`${group.day}-${entry.actor}-${index}`"
                    class="task-modal__activity-item"
                  >
                    <div class="task-modal__activity-avatar-wrap">
                      <AssigneeAvatar
                        :assignee="entry.actor"
                        size="sm"
                      />
                    </div>
                    <div class="task-modal__activity-content">
                      <p class="task-modal__activity-text">
                        <span class="task-modal__activity-actor">{{ entry.actor }}</span>
                        {{ ' ' }}{{ entry.action }}{{ ' ' }}
                        <span class="task-modal__activity-subject">{{ entry.subject }}</span>
                        <template v-if="entry.detail">
                          {{ ' ' }}{{ entry.detail }}
                        </template>
                      </p>
                      <span class="task-modal__activity-time">{{ entry.time }}</span>

                      <div
                        v-if="entry.attachment"
                        class="task-modal__attachment"
                      >
                        <div class="task-modal__attachment-icon">
                          <span>PDF</span>
                        </div>
                        <div class="task-modal__attachment-copy">
                          <strong>User Flow</strong>
                          <span>PDF · 2.35 mb</span>
                        </div>
                        <button
                          type="button"
                          class="task-modal__attachment-action"
                          aria-label="Download attachment"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M12 15V3m0 12 4-4m-4 4-4-4"
                              stroke="currentColor"
                              stroke-width="1.75"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            />
                            <path
                              d="M2 17v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2"
                              stroke="currentColor"
                              stroke-width="1.75"
                              stroke-linecap="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>

            <footer class="task-modal__footer">
              <button
                type="button"
                class="task-modal__btn task-modal__btn--secondary"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="task-modal__btn task-modal__btn--primary"
              >
                {{ isEditing ? 'Save changes' : 'Create task' }}
              </button>
            </footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.task-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background-color: rgba(15, 23, 42, 0.35);
}

.task-modal {
  display: flex;
  flex-direction: column;
  width: min(520px, 46vw);
  min-width: 420px;
  height: 100vh;
  height: 100dvh;
  background-color: #ffffff;
  box-shadow: -12px 0 40px rgba(15, 23, 42, 0.12);
  overflow: hidden;
}

.task-modal__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.task-modal__header-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}

.task-modal__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
}

.task-modal__icon-btn svg {
  width: 18px;
  height: 18px;
}

.task-modal__icon-btn:hover {
  background-color: #f8fafc;
  color: #64748b;
}

.task-modal__form {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.task-modal__body {
  display: block;
  flex: 1;
  min-height: 0;
  padding: 4px 28px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.task-modal__body::-webkit-scrollbar {
  width: 4px;
}

.task-modal__body::-webkit-scrollbar-track {
  background: transparent;
}

.task-modal__body::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 6px;
}

.task-modal__body::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}

.task-modal__title-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
  margin-bottom: 20px;
}

.task-modal__title-input {
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: #111827;
  outline: none;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.task-modal__title-input::placeholder {
  color: #d1d5db;
}

.task-modal__meta {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  margin-bottom: 20px;
}

.task-modal__meta-row {
  display: grid;
  grid-template-columns: 128px minmax(0, 1fr);
  align-items: center;
  gap: 16px;
  min-height: 40px;
  padding: 10px 0;
}

.task-modal__meta-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  white-space: nowrap;
}

.task-modal__meta-value {
  margin: 0;
  min-width: 0;
  font-size: 14px;
  color: #1f2937;
}

.task-modal__meta-value--plain {
  font-size: 14px;
  font-weight: 400;
  color: #1f2937;
  line-height: 1.4;
}

.task-modal__ghost-control {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  opacity: 0;
  cursor: pointer;
  background: transparent;
  font-size: 16px;
}

.task-modal__value-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: var(--font-size-badge);
  font-weight: var(--font-weight-badge);
  line-height: 1.3;
  border: none;
}

.task-modal__dropdown {
  position: relative;
  display: inline-flex;
}

.task-modal__dropdown-trigger {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.task-modal__dropdown-trigger:hover {
  opacity: 0.92;
}

.task-modal__dropdown-trigger:focus-visible {
  outline: 2px solid #c4b5fd;
  outline-offset: 2px;
}

.task-modal__dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  min-width: 148px;
  margin: 0;
  padding: 4px;
  list-style: none;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.task-modal__dropdown-item {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 400;
  color: #1f2937;
  line-height: 1.3;
  cursor: pointer;
  transition: background-color 0.12s ease, color 0.12s ease;
}

.task-modal__dropdown-item:hover {
  background-color: #7c3aed;
  color: #ffffff;
}

.task-modal__dropdown-item--selected {
  font-weight: 600;
  color: #1f2937;
}

.task-modal__dropdown-item--selected:hover {
  color: #ffffff;
}

.task-modal__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.task-modal__value-badge--status-todo {
  background-color: var(--status-todo-bg);
  color: var(--status-todo-text);
}

.task-modal__value-badge--status-todo .task-modal__badge-dot {
  background-color: var(--status-todo-dot);
}

.task-modal__value-badge--status-progress {
  background-color: var(--status-progress-bg);
  color: var(--status-progress-text);
}

.task-modal__value-badge--status-progress .task-modal__badge-dot {
  background-color: var(--status-progress-dot);
}

.task-modal__value-badge--status-done {
  background-color: var(--status-done-bg);
  color: var(--status-done-text);
}

.task-modal__value-badge--status-done .task-modal__badge-dot {
  background-color: var(--status-done-dot);
}

.task-modal__value-badge--priority-low,
.task-modal__value-badge--priority-medium,
.task-modal__value-badge--priority-high {
  border-radius: 999px;
}

.task-modal__value-badge--priority-low {
  background-color: var(--priority-low-bg);
  color: var(--priority-low-text);
}

.task-modal__value-badge--priority-medium {
  background-color: var(--priority-medium-bg);
  color: var(--priority-medium-text);
}

.task-modal__value-badge--priority-high {
  background-color: var(--priority-high-bg);
  color: var(--priority-high-text);
}

.task-modal__date-display {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 40px;
  margin: -8px 0;
  padding: 8px 0;
  cursor: pointer;
}

.task-modal__date-input-overlay {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  opacity: 0;
  pointer-events: none;
  background: transparent;
  color-scheme: light;
}

.task-modal__date-text {
  font-size: 14px;
  font-weight: 400;
  color: #1f2937;
  line-height: 1.4;
}

.task-modal__date-text--placeholder {
  color: #9ca3af;
}

.task-modal__tag-chips {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 28px;
}

.task-modal__tag-chips--clickable {
  width: 100%;
  min-height: 40px;
  margin: -8px 0;
  padding: 8px 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.task-modal__tag-chips--clickable:focus-visible {
  outline: 2px solid #c4b5fd;
  outline-offset: 2px;
  border-radius: 6px;
}

.task-modal__tags-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background-color: #ffffff;
  color: #1f2937;
  font-size: 13px;
  font-weight: 400;
  outline: none;
}

.task-modal__tags-input:focus {
  border-color: #c4b5fd;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.1);
}

.task-modal__tags-input::placeholder {
  color: #9ca3af;
}

.task-modal__tag-chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: #f3f4f6;
  color: #4b5563;
  font-size: var(--font-size-badge);
  font-weight: var(--font-weight-badge);
  line-height: 1.3;
}

.task-modal__tag-placeholder,
.task-modal__assignee-placeholder {
  font-size: 14px;
  color: #9ca3af;
}

.task-modal__assignee-menu {
  min-width: 220px;
}

.task-modal__assignee-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-modal__assignee-option-avatar {
  flex-shrink: 0;
}

.task-modal__avatar-stack {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
}

.task-modal__avatar-stack--clickable {
  width: 100%;
  min-height: 40px;
  margin: -8px 0;
  padding: 8px 0;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.task-modal__avatar-stack--clickable:focus-visible {
  outline: 2px solid #c4b5fd;
  outline-offset: 2px;
  border-radius: 6px;
}

.task-modal__stack-avatar {
  margin-left: -8px;
  border: 2px solid #ffffff;
  border-radius: 50%;
}

.task-modal__stack-avatar:first-child {
  margin-left: 0;
}

.task-modal__meta-value--stacked {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.task-modal__description {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px;
  background-color: #f7f7f7;
  border-radius: 10px;
  margin-bottom: 20px;
}

.task-modal__description-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.task-modal__description-input {
  width: 100%;
  min-height: 68px;
  max-height: 120px;
  padding: 0;
  border: none;
  background: transparent;
  color: #374151;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
  outline: none;
}

.task-modal__tabs {
  display: flex;
  align-items: center;
  gap: 0;
  padding-top: 0;
  border-top: 1px solid #f1f5f9;
  margin-bottom: 14px;
}

.task-modal__tab {
  padding: 10px 0 8px;
  margin-right: 20px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
}

.task-modal__tab--active {
  color: #7c3aed;
  border-bottom-color: #7c3aed;
  font-weight: 600;
}

.task-modal__activity {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.task-modal__activity-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-modal__activity-day {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.task-modal__activity-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
}

.task-modal__activity-list::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 12px;
  bottom: 12px;
  width: 1px;
  background-color: #e2e8f0;
}

.task-modal__activity-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  position: relative;
}

.task-modal__activity-avatar-wrap {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  background: #ffffff;
  border-radius: 50%;
}

.task-modal__activity-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding-top: 2px;
}

.task-modal__activity-text {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.task-modal__activity-actor,
.task-modal__activity-subject {
  color: #0f172a;
  font-weight: 600;
}

.task-modal__activity-time {
  color: #94a3b8;
  font-size: 11px;
}

.task-modal__attachment {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 260px;
  margin-top: 6px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
}

.task-modal__attachment-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #fef2f2;
  color: #ef4444;
  font-size: 9px;
  font-weight: 700;
  flex-shrink: 0;
}

.task-modal__attachment-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.task-modal__attachment-copy strong {
  font-size: 11px;
  color: #0f172a;
}

.task-modal__attachment-copy span {
  font-size: 11px;
  color: #94a3b8;
}

.task-modal__attachment-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  flex-shrink: 0;
}

.task-modal__attachment-action:hover {
  background: #f8fafc;
  color: #64748b;
}

.task-modal__attachment-action svg {
  width: 18px;
  height: 18px;
}

.task-modal__footer {
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 28px 20px;
  border-top: 1px solid #f0f0f0;
  background: #ffffff;
}

.task-modal__btn {
  min-width: 100px;
  height: 36px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.task-modal__btn--secondary {
  background-color: #ffffff;
  border-color: #e2e8f0;
  color: #475569;
}

.task-modal__btn--secondary:hover {
  background-color: #f8fafc;
}

.task-modal__btn--primary {
  background-color: #7c3aed;
  color: #ffffff;
}

.task-modal__btn--primary:hover {
  background-color: #6d28d9;
}

.task-modal__error {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-priority-high);
}

.task-modal-enter-active,
.task-modal-leave-active {
  transition: opacity 0.25s ease;
}

.task-modal-enter-active .task-modal,
.task-modal-leave-active .task-modal {
  transition: transform 0.25s ease;
}

.task-modal-enter-from,
.task-modal-leave-to {
  opacity: 0;
}

.task-modal-enter-from .task-modal,
.task-modal-leave-to .task-modal {
  transform: translateX(100%);
}
</style>
