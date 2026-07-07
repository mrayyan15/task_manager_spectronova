<script setup lang="ts">
import { computed, defineComponent, h, ref, type PropType } from 'vue';
import { TaskManager } from '../../BLL/taskManager/TaskManager';
import { ASSIGNEES, type Task, type TaskPriority, type TaskStatus, type TaskModalMode } from '../../BLL/taskManager/types';
import AssigneeAvatar from '../../components/taskManager/AssigneeAvatar.vue';
import AssessmentNotice from '../../components/taskManager/AssessmentNotice.vue';
import DeleteConfirmModal from '../../components/taskManager/DeleteConfirmModal.vue';
import KanbanBoard from '../../components/taskManager/KanbanBoard.vue';
import ListView from '../../components/taskManager/ListView.vue';
import TaskModal from '../../components/taskManager/TaskModal.vue';
import ViewToggle from '../../components/taskManager/ViewToggle.vue';
import { openDesignOnlyNotice } from '../../utils/designOnlyNotice';

const manager = new TaskManager();

const modalMode = ref<TaskModalMode>({ kind: 'closed' });
const showFilters = ref(false);

const activeView = computed(() => manager.state.activeView);

const priorityFilter = computed(() => manager.state.filters.priority ?? '');

const UNASSIGNED_FILTER_VALUE = '__unassigned__';

const assigneeFilter = computed(() => {
  const { assignee } = manager.state.filters;
  if (assignee == null) {
    return '';
  }
  if (assignee === '') {
    return UNASSIGNED_FILTER_VALUE;
  }
  return assignee;
});

const assigneeOptions = computed(() => manager.getAssigneeFilterOptions());

const searchQuery = computed({
  get: () => manager.state.searchQuery,
  set: (value: string) => manager.setSearchQuery(value),
});

function showDesignOnly(feature: string): void {
  openDesignOnlyNotice(feature);
}

function onSidebarClick(item: SidebarNavItem): void {
  if (item.active) {
    return;
  }
  showDesignOnly(item.label);
}

const teamAvatars = computed(() => ASSIGNEES.slice(0, 3).map((person) => person.name));

const extraTeamCount = computed(() => Math.max(0, ASSIGNEES.length - teamAvatars.value.length));

const currentUser = ASSIGNEES[0];

type SidebarIconName =
  | 'dashboard'
  | 'inbox'
  | 'calendar'
  | 'tasks'
  | 'docs'
  | 'meeting'
  | 'settings'
  | 'support';

interface SidebarNavItem {
  label: string;
  icon: SidebarIconName;
  active?: boolean;
}

const svgAttrs = {
  class: 'sidebar__link-icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 1.5,
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
  'aria-hidden': true as const,
};

const SidebarNavIcon = defineComponent({
  name: 'SidebarNavIcon',
  props: {
    name: {
      type: String as PropType<SidebarIconName>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      switch (props.name) {
        case 'dashboard':
          return h('svg', svgAttrs, [
            h('path', { d: 'M4.5 10.75 12 5.25l7.5 5.5V20a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1v-9.25z' }),
            h('path', { d: 'M10 21v-4.25h4V21' }),
          ]);
        case 'inbox':
          return h('svg', svgAttrs, [
            h('path', { d: 'M5 9h14v10a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9z' }),
            h('path', { d: 'M5 9h3.75l1.75 2.25h4l1.75-2.25H19' }),
          ]);
        case 'calendar':
          return h('svg', svgAttrs, [
            h('rect', { x: 4, y: 6, width: 16, height: 15, rx: 2 }),
            h('path', { d: 'M8 4v4' }),
            h('path', { d: 'M16 4v4' }),
            h('path', { d: 'M4 11h16' }),
          ]);
        case 'tasks':
          return h('svg', svgAttrs, [
            h('rect', { x: 5, y: 5, width: 14, height: 14, rx: 2 }),
            h('path', { d: 'M8.75 12.25 11 14.5l4.75-5' }),
          ]);
        case 'docs':
          return h('svg', svgAttrs, [
            h('path', { d: 'M8 4h7l3 3v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z' }),
            h('path', { d: 'M15 4v3h3' }),
            h('path', { d: 'M9 11h6' }),
            h('path', { d: 'M9 14.5h6' }),
            h('path', { d: 'M9 18h4' }),
          ]);
        case 'meeting':
          return h('svg', svgAttrs, [
            h('circle', { cx: 12, cy: 9, r: 3.25 }),
            h('path', { d: 'M5.5 20.25v-.5a6.5 6.5 0 0 1 13 0v.5' }),
          ]);
        case 'settings':
          return h('svg', svgAttrs, [
            h('path', {
              d: 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
            }),
            h('circle', { cx: 12, cy: 12, r: 3 }),
          ]);
        case 'support':
          return h('svg', svgAttrs, [
            h('circle', { cx: 12, cy: 12, r: 8.25 }),
            h('circle', { cx: 12, cy: 12, r: 3.25 }),
            h('path', { d: 'M7.1 7.1l2.1 2.1M14.8 14.8l2.1 2.1M16.9 7.1l-2.1 2.1M9.2 14.8l-2.1 2.1' }),
          ]);
        default:
          return h('svg', svgAttrs);
      }
    };
  },
});

const MENU_ITEMS: SidebarNavItem[] = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Inbox', icon: 'inbox' },
  { label: 'Calendar', icon: 'calendar' },
];

const TEAM_ITEMS: SidebarNavItem[] = [
  { label: 'Tasks', icon: 'tasks', active: true },
  { label: 'Docs', icon: 'docs', active: false },
  { label: 'Meeting', icon: 'meeting', active: false },
];

const OTHER_ITEMS: SidebarNavItem[] = [
  { label: 'Settings', icon: 'settings' },
  { label: 'Support', icon: 'support' },
];

function onPriorityFilterChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  manager.setFilter({
    priority: value === '' ? null : (value as TaskPriority),
  });
}

function onAssigneeFilterChange(event: Event): void {
  const value = (event.target as HTMLSelectElement).value;
  if (value === '') {
    manager.setFilter({ assignee: null });
    return;
  }
  if (value === UNASSIGNED_FILTER_VALUE) {
    manager.setFilter({ assignee: '' });
    return;
  }
  manager.setFilter({ assignee: value });
}

function openCreateModal(status: TaskStatus = 'todo'): void {
  modalMode.value = { kind: 'create', initialStatus: status };
}

function openEditModal(task: Task): void {
  modalMode.value = { kind: 'edit', task };
}

function closeModal(): void {
  modalMode.value = { kind: 'closed' };
}
</script>

<template>
  <div class="app-layout">
    <div class="sidebar-header">
      <div class="sidebar__profile-card">
        <AssigneeAvatar
          :assignee="currentUser.name"
          size="lg"
          class="sidebar__avatar"
        />
        <div class="sidebar__profile-text">
          <span class="sidebar__profile-name">{{ currentUser.name }}</span>
          <span class="sidebar__profile-email">daviddoni@gmail.c0m</span>
        </div>
        <button
          type="button"
          class="sidebar__profile-menu"
          aria-label="Profile options"
          @click="showDesignOnly('Profile menu')"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <circle
              cx="8"
              cy="4"
              r="1.25"
              fill="currentColor"
            />
            <circle
              cx="8"
              cy="8"
              r="1.25"
              fill="currentColor"
            />
            <circle
              cx="8"
              cy="12"
              r="1.25"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>

    <aside
      class="sidebar"
      aria-label="Main navigation"
    >
      <nav
        class="sidebar__section"
        aria-label="Menu"
      >
        <p class="sidebar__section-label">Menu</p>
        <a
          v-for="item in MENU_ITEMS"
          :key="item.label"
          href="#"
          class="sidebar__link"
          @click.prevent="showDesignOnly(item.label)"
        >
          <SidebarNavIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <hr class="sidebar__divider">

      <nav
        class="sidebar__section"
        aria-label="Team spaces"
      >
        <div class="sidebar__section-header">
          <p class="sidebar__section-label">Team spaces</p>
          <button
            type="button"
            class="sidebar__section-add"
            aria-label="Add team space"
            @click="showDesignOnly('Add team space')"
          >
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
            >
              <path
                d="M8 3.5v9M3.5 8h9"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>
        <a
          v-for="item in TEAM_ITEMS"
          :key="item.label"
          href="#"
          class="sidebar__link"
          :class="{ 'sidebar__link--active': item.active }"
          :aria-current="item.active ? 'page' : undefined"
          @click.prevent="onSidebarClick(item)"
        >
          <SidebarNavIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </nav>

      <hr class="sidebar__divider">

      <nav
        class="sidebar__section sidebar__section--grow"
        aria-label="Other"
      >
        <p class="sidebar__section-label">Other</p>
        <a
          v-for="item in OTHER_ITEMS"
          :key="item.label"
          href="#"
          class="sidebar__link"
          @click.prevent="showDesignOnly(item.label)"
        >
          <SidebarNavIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </a>
      </nav>
    </aside>

    <header class="topbar">
      <div class="topbar__breadcrumbs">
        <button
          type="button"
          class="topbar__back"
          aria-label="Go back"
          @click="showDesignOnly('Back navigation')"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M12 8H5M8 5 5 8 8 11"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <span class="meta-label topbar__crumb">Team spaces</span>
        <span
          class="topbar__sep"
          aria-hidden="true"
        >
          <svg viewBox="0 0 16 16">
            <path
              d="M6 3l5 5-5 5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <span class="topbar__crumb-current">Tasks</span>
      </div>

      <div class="topbar__actions">
        <div class="topbar__search">
          <svg
            class="topbar__search-icon"
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <circle
              cx="7"
              cy="7"
              r="4.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.25"
            />
            <path
              d="M10.5 10.5 14 14"
              stroke="currentColor"
              stroke-width="1.25"
              stroke-linecap="round"
            />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            class="topbar__search-input"
            placeholder="Search"
            aria-label="Search"
          >
          <kbd class="topbar__kbd">
            <span class="topbar__kbd-symbol" aria-hidden="true">⌘</span>
            <span class="topbar__kbd-letter">F</span>
          </kbd>
        </div>
        <span
          class="topbar__actions-divider"
          aria-hidden="true"
        />
        <button
          type="button"
          class="topbar__icon-btn"
          aria-label="Help"
          @click="showDesignOnly('Help')"
        >
          ?
        </button>
        <button
          type="button"
          class="topbar__icon-btn"
          aria-label="Notifications"
          @click="showDesignOnly('Notifications')"
        >
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M8 2a4 4 0 0 0-4 4v2.5L3 10.5h10l-1-2V6a4 4 0 0 0-4-4zm0 11a1.5 1.5 0 0 0 1.5-1.5H6.5A1.5 1.5 0 0 0 8 13z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </header>

    <div class="main">
      <div class="page">
        <div class="page__header">
          <div class="page__header-left">
            <h1 class="page-title">Tasks</h1>
            <p class="page__subtitle meta-label">
              Short description will be placed here
            </p>
          </div>

          <div class="page__header-right">
            <div class="page__team">
              <AssigneeAvatar
                v-for="name in teamAvatars"
                :key="name"
                :assignee="name"
                size="md"
                class="page__team-avatar"
              />
              <span
                v-if="extraTeamCount > 0"
                class="page__team-more"
                role="button"
                tabindex="0"
                @click="showDesignOnly('Team members')"
                @keydown.enter="showDesignOnly('Team members')"
              >+{{ extraTeamCount }}</span>
            </div>
            <button
              type="button"
              class="page__btn page__btn--primary"
              @click="showDesignOnly('Invite Member')"
            >
              + Invite Member
            </button>
            <button
              type="button"
              class="page__btn page__btn--secondary"
              @click="showDesignOnly('Share')"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M8 2v8M5 6l3-3 3 3M3 12h10"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Share
            </button>
          </div>
        </div>

        <div class="page__tabs-row">
          <div class="page__tabs">
            <button
              type="button"
              class="page__tab"
              @click="showDesignOnly('Overview')"
            >
              Overview
            </button>
            <ViewToggle :manager="manager" />
            <button
              type="button"
              class="page__tab"
              @click="showDesignOnly('Table view')"
            >
              <svg
                class="page__tab-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <rect
                  x="2"
                  y="2"
                  width="12"
                  height="12"
                  rx="1"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                />
                <path
                  d="M2 8h12M8 2v12"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                />
              </svg>
              Table
            </button>
            <button
              type="button"
              class="page__tab"
              @click="showDesignOnly('Timeline view')"
            >
              <svg
                class="page__tab-icon"
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="5.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                />
                <path
                  d="M8 8V4.75"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <path
                  d="M8 8h3.25"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
              </svg>
              Timeline
            </button>
          </div>

          <div class="page__toolbar">
            <button
              type="button"
              class="page__tool-btn"
              :class="{ 'page__tool-btn--active': showFilters }"
              @click="showFilters = !showFilters"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <path
                  d="M2 4h12M4 8h8M6 12h4"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
              </svg>
              Filter
            </button>
            <button
              type="button"
              class="page__tool-btn"
              @click="showDesignOnly('Group by')"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8 2.25 12.5 4.75 8 7.25 3.5 4.75 8 2.25z"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linejoin="round"
                />
                <path
                  d="M3.5 7.25 8 9.75 12.5 7.25"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Group by
            </button>
            <button
              type="button"
              class="page__tool-btn"
              @click="showDesignOnly('Toolbar sort')"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2.5 4.5h9"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <path
                  d="M2.5 8h6"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <path
                  d="M2.5 11.5h3.5"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <path
                  d="M12.25 4.5v5.75"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                />
                <path
                  d="M10.75 8.75 12.25 10.25 13.75 8.75"
                  stroke="currentColor"
                  stroke-width="1.25"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Sort
            </button>
            <button
              type="button"
              class="page__tool-btn page__tool-btn--icon"
              aria-label="More"
              @click="showDesignOnly('More options')"
            >
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="4"
                  r="1.25"
                  fill="currentColor"
                />
                <circle
                  cx="8"
                  cy="8"
                  r="1.25"
                  fill="currentColor"
                />
                <circle
                  cx="8"
                  cy="12"
                  r="1.25"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          v-if="showFilters"
          class="page__filters"
        >
          <label class="page__filter">
            <span class="meta-label page__filter-label">Filter by Priority</span>
            <select
              class="page__select"
              :value="priorityFilter"
              @change="onPriorityFilterChange"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label class="page__filter">
            <span class="meta-label page__filter-label">Filter by Assignee</span>
            <select
              class="page__select"
              :value="assigneeFilter"
              @change="onAssigneeFilterChange"
            >
              <option value="">All assignees</option>
              <option
                v-if="assigneeOptions.hasUnassigned"
                :value="UNASSIGNED_FILTER_VALUE"
              >
                Unassigned
              </option>
              <option
                v-for="name in assigneeOptions.names"
                :key="name"
                :value="name"
              >
                {{ name }}
              </option>
            </select>
          </label>
        </div>

        <main class="page__content">
          <KanbanBoard
            v-if="activeView === 'kanban'"
            :manager="manager"
            @edit="openEditModal"
            @add-task="openCreateModal"
          />
          <ListView
            v-else
            :manager="manager"
            @edit="openEditModal"
          />
        </main>
      </div>
    </div>

    <TaskModal
      :manager="manager"
      :modal-mode="modalMode"
      @close="closeModal"
    />

    <AssessmentNotice />
    <DeleteConfirmModal />
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'sidebar-header topbar'
    'sidebar main';
  width: 100%;
  max-width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--color-page-bg);
}

.sidebar-header {
  grid-area: sidebar-header;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-width: 0;
  padding: var(--space-4) var(--space-4) 0;
  background: var(--color-sidebar-bg);
  border-right: 1px solid #e5e7eb;
}

/* Sidebar */
.sidebar {
  grid-area: sidebar;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-4) var(--space-4) var(--space-6);
  background: var(--color-sidebar-bg);
  border-right: 1px solid #e5e7eb;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 999px;
}

.sidebar__profile-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.sidebar__avatar {
  width: 40px !important;
  height: 40px !important;
  flex-shrink: 0;
}

.sidebar__profile-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.sidebar__profile-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__profile-email {
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__profile-menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  flex-shrink: 0;
}

.sidebar__profile-menu svg {
  width: 16px;
  height: 16px;
}

.sidebar__profile-menu:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.sidebar__profile-menu:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.sidebar__divider {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: var(--space-4) 0;
}

.sidebar__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.sidebar__section--grow {
  flex: 1;
}

.sidebar__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3);
  margin-bottom: var(--space-1);
}

.sidebar__section-label {
  margin: 0 0 var(--space-2);
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  color: #9ca3af;
  letter-spacing: 0;
  text-transform: none;
}

.sidebar__section-header .sidebar__section-label {
  margin: 0;
  padding: 0;
}

.sidebar__section-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
}

.sidebar__section-add svg {
  width: 14px;
  height: 14px;
}

.sidebar__section-add:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.sidebar__section-add:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.sidebar__link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border: 1px solid transparent;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  text-decoration: none;
  position: relative;
  transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}

.sidebar__link svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.sidebar__link--active svg {
  color: #604d9a;
}

.sidebar__link:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.sidebar__link:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 1px;
}

.sidebar__link--active {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #374151;
  font-weight: 500;
}

.sidebar__link--active:hover {
  background: #ffffff;
  color: #374151;
}

.sidebar__link--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 2px 2px 0;
  background: #604d9a;
}

/* Main */
.main {
  grid-area: main;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: auto;
}

.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  min-width: 0;
  align-self: stretch;
  box-sizing: border-box;
  flex-shrink: 0;
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.topbar__breadcrumbs {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
}

.topbar__back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
}

.topbar__back svg {
  width: 20px;
  height: 20px;
}

.topbar__crumb {
  color: var(--color-text-muted);
}

.topbar__sep {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-text-muted);
}

.topbar__sep svg {
  width: 16px;
  height: 16px;
}

.topbar__crumb-current {
  font-size: var(--font-size-card-body);
  font-weight: 500;
  color: var(--color-text);
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  flex-shrink: 1;
}

.topbar__actions-divider {
  width: 1px;
  height: 24px;
  flex-shrink: 0;
  background: var(--color-border);
  margin: 0 var(--space-1);
}

.topbar__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  min-width: 0;
  flex: 1 1 160px;
  max-width: 280px;
}

.topbar__search-icon {
  width: 16px;
  height: 16px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.topbar__search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-card-body);
  color: var(--color-text);
  background: transparent;
  min-width: 0;
}

.topbar__search-input::placeholder {
  color: var(--color-text-muted);
}

.topbar__kbd {
  display: inline-flex;
  align-items: center;
  gap: 1px;
  padding: 0;
  border: none;
  background: transparent;
  color: #d1d5db;
  font-family: inherit;
  line-height: 1;
}

.topbar__kbd-symbol {
  font-size: 13px;
  line-height: 1;
}

.topbar__kbd-letter {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
}

.topbar__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.topbar__icon-btn svg {
  width: 16px;
  height: 16px;
}

/* Page */
.page {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: var(--space-5) var(--space-6) var(--space-6);
  overflow-x: hidden;
}

.page__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  min-width: 0;
  margin-bottom: var(--space-5);
}

.page__subtitle {
  margin: var(--space-1) 0 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-card-body);
}

.page__header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-shrink: 0;
}

.page__team {
  display: flex;
  align-items: center;
}

.page__team-avatar {
  margin-left: -8px;
  border: 2px solid #fff;
}

.page__team-avatar:first-child {
  margin-left: 0;
}

.page__team-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-left: -8px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 2px solid #fff;
  font-size: var(--font-size-badge);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.page__btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: 8px;
  font-size: var(--font-size-card-body);
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
}

.page__btn svg {
  width: 16px;
  height: 16px;
}

.page__btn--primary {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}

.page__btn--primary:hover {
  background: var(--color-primary-hover);
}

.page__btn--secondary {
  background: #fff;
  color: var(--color-text);
  border-color: var(--color-border);
}

.page__btn--secondary:hover {
  background: #f9fafb;
}

.page__tabs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
  min-width: 0;
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.page__tabs {
  display: flex;
  align-items: flex-end;
  gap: var(--space-1);
}

.page__tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-card-body);
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.page__tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.page__tab:hover {
  color: var(--color-text);
}

.page__toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-bottom: var(--space-2);
}

.page__tool-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-card-body);
  font-weight: 500;
  cursor: pointer;
}

.page__tool-btn svg {
  width: 16px;
  height: 16px;
}

.page__tool-btn:hover,
.page__tool-btn--active {
  background: #f3f4f6;
  color: var(--color-text);
}

.page__tool-btn--icon {
  padding: var(--space-2);
}

.page__filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: #f9fafb;
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.page__filter {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 200px;
}

.page__filter-label {
  color: var(--color-text-secondary);
}

.page__select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: #fff;
  color: var(--color-text);
  font-size: var(--font-size-card-body);
  font-weight: 500;
  outline: none;
  cursor: pointer;
}

.page__select:focus {
  border-color: #c4b5fd;
}

.page__content {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

@media (max-width: 1280px) {
  .page__header {
    flex-wrap: wrap;
    row-gap: var(--space-3);
  }

  .page__header-right {
    flex-wrap: wrap;
  }

  .page__tabs-row {
    flex-wrap: wrap;
    row-gap: var(--space-2);
  }

  .topbar__search {
    min-width: 180px;
  }
}
</style>
