# Task Manager (Spectronova)

A Vue 3 + TypeScript task management application built for a frontend take-home assessment. It implements a Kanban board with drag-and-drop, a sortable and filterable list view, full task CRUD, and a design-faithful shell UI. Business logic lives in a single `TaskManager` class; the UI is a thin, reactive layer on top.

**Author:** Mohammad Rayyan · [mrayyan63151@gmail.com](mailto:mrayyan63151@gmail.com)

---

## Setup

**Prerequisites:** Node.js 18 or later (LTS recommended).

```bash
npm install && npm run dev
```

Vite serves the app at `http://localhost:5173` by default.

**Production build:**

```bash
npm run build
```

Runs `vue-tsc` for type checking, then `vite build`. Output goes to `dist/`. Preview with:

```bash
npm run preview
```

No environment variables or external services are required. Task data is in memory and seeded from mock data on load.

---

## Features

| Area | What works |
|------|------------|
| **Kanban** | Columns driven from `TaskManager` state (three defaults: To do, In Progress, Done), horizontal scroll for overflow, native HTML5 drag-and-drop between columns, per-column counts and empty states, add-task per column |
| **List view** | Tabular layout with sort by due date or priority (toggle asc/desc), filter by priority and assignee |
| **Tasks** | Create, edit, and delete via modal; delete requires confirmation |
| **Search** | Topbar search filters tasks by title, description, tags, and assignee name (applies to both Board and List views) |
| **Overdue** | Tasks past their due date show a red date and warning icon when status is not Done |
| **View persistence** | Active view (Board / List), sort field/direction, and priority/assignee filters saved to `localStorage` |
| **Assignees** | Centralized `ASSIGNEES` roster; multi-select picker in task modal; filter lists all roster members; initials-based avatars with deterministic background colours |

---

## Architecture

### Project structure

```
src/
├── main.ts                          # App bootstrap
├── App.vue                          # Root shell → TaskManager page
├── pages/taskManager/index.vue      # Page layout: sidebar, topbar, filters, view routing
├── components/taskManager/
│   ├── KanbanBoard.vue              # Horizontal board + add-column control
│   ├── KanbanColumn.vue             # Single column + drop zone + drag handlers
│   ├── TaskCard.vue                 # Kanban task card
│   ├── ListView.vue                 # Sortable/filterable table
│   ├── TaskModal.vue                # Create/edit slide-over panel
│   ├── ViewToggle.vue               # Board ↔ List tab control
│   ├── AssigneeAvatar.vue           # Initials avatar (sm / md / lg)
│   ├── AssessmentNotice.vue         # Design-only feature modal
│   ├── DeleteConfirmModal.vue       # Delete confirmation dialog
│   └── TaskModalMetaIcon.vue        # Icon helper for modal metadata rows
├── BLL/taskManager/
│   ├── TaskManager.ts               # Central business logic + reactive state
│   ├── types.ts                     # Task, KanbanColumnConfig, ASSIGNEES, FilterConfig, SortConfig, etc.
│   └── mockData.ts                  # Seed tasks
├── utils/
│   ├── badgeColors.ts               # Status/priority colour tokens
│   ├── colors.ts                    # Deterministic assignee avatar colours
│   ├── initials.ts                  # Name → initials
│   ├── designOnlyNotice.ts          # Shared state for assessment notice modal
│   └── deleteConfirm.ts             # Shared state for delete confirmation
└── styles/global.css                # Design tokens, typography, utilities
```

### Data flow

The page creates one `TaskManager` instance and passes it as a `:manager` prop. Children call `manager.addTask()`, `manager.moveTo()`, `manager.setFilter()`, and similar methods instead of mutating task data directly. Modal open/close state stays in the page because it coordinates board, list, and modal.

Global modals (`AssessmentNotice`, `DeleteConfirmModal`) use small utility modules with shared `ref`s so deep children can trigger them without prop-drilling.

### TaskManager

`TaskManager` is a plain TypeScript class whose `state` is wrapped in Vue's `reactive()`. Single source of truth for tasks, columns, filters, search, sort, and active view — no Pinia or Vuex.

**State:** `tasks`, `columns` (`KanbanColumnConfig[]`), `activeView`, `filters`, `searchQuery`, `sort`

**Key methods:**

- **CRUD:** `addTask`, `updateTask`, `deleteTask`, `moveTo`
- **Columns:** `getColumns`, `addColumn` (BLL ready; UI not wired)
- **Query:** `getTasks()` / `getTasksByStatus()` run filter → sort pipeline
- **Filters & search:** `setFilter`, `setSearchQuery` (search matches title, description, tags, assignee)
- **Presentation:** `isOverdue`, `formatDueDate`, `getStatusBadgeMeta`, `getPriorityBadgeMeta`
- **View & sort:** `toggleView`, `setSort` (both persisted to `localStorage` where noted above)

`TaskStatus` is typed as `string` so custom column ids work alongside built-in `todo`, `in-progress`, and `done`. `getStatusBadgeMeta` resolves labels and colours from column config for user-added columns.

### Trade-offs

| Choice | Benefit | Cost |
|--------|---------|------|
| **Reactive class instead of Pinia** | Minimal dependencies, clear BLL boundary | No devtools time-travel; harder to scale to many stores or SSR |
| **Prop-drilled `manager`** | Explicit data flow in every component | Verbose at this depth; acceptable here |
| **Native HTML5 drag-and-drop** | Zero extra libraries | No within-column reorder; limited touch support |
| **In-memory mock data** | Fast to build and demo | Refresh loses CRUD changes; no multi-user sync |
| **Comma-separated assignee names** | Simple task model | No assignee IDs; roster is static in code |
| **Search in session only** | Simple implementation | Query resets on refresh |

---

## Design Decisions

### 1. Initials-only assignee avatars

`ASSIGNEES` is the canonical roster for the modal picker and filters. `AssigneeAvatar` renders deterministic initials and background colours — no external avatar service, works offline, stays readable at small sizes.

### 2. Design-only notice for non-assessment UI

Sidebar links, notifications, table/timeline tabs, card footer stats, add-column button, and column options open `AssessmentNotice` explaining the control is design reference only. Keeps effort focused on core task flows.

### 3. Delete confirmation modal (not `window.confirm`)

`DeleteConfirmModal` is an accessible `alertdialog` triggered via `openDeleteConfirm(task, manager)` from any component.

### 4. Overdue styling only for incomplete tasks

When `dueDate` is before today and `status !== 'done'`, the due date renders in red with a warning icon. Completed tasks never show overdue styling.

---

## Known Limitations

### Design-only UI

Opens the assessment notice modal or does nothing:

- Sidebar: Dashboard, Inbox, Calendar, Docs, Meeting, Settings, Support, profile menu, add team space
- Topbar: back navigation, help, notifications (search **is** functional)
- Page header: Invite Member, Share, team member overflow (+N)
- Tabs: Overview, Table, Timeline (only Board and List work)
- Toolbar: Group by, Sort buttons (sorting works inside List view only)
- Kanban: Add column button, column options menu (`addColumn` exists in BLL but is not wired)
- Task card footer: Comments, Links, Subtasks counts (decorative, derived from task id hash)

### Data and persistence

- Tasks and columns reset on refresh; view, sort, and priority/assignee filters restore from `localStorage`
- Search query is not persisted
- No backend, authentication, or real-time sync

### Behavioural compromises

- Drag-and-drop changes status only; no reorder within a column
- Assignees selected from fixed roster; stored as comma-separated names on tasks
- Filters: priority, assignee, and text search; no tag-only or date-range filters
- Shared sort state between Kanban (per column) and list view
- Layout targets desktop; sidebar does not collapse on narrow viewports

---

## Time Log (48 hours)

| Phase | Hours | Activities |
|-------|------:|------------|
| Planning & setup | 4 | Brief review, Vite + Vue 3 + TypeScript scaffold, folder structure, CSS tokens |
| Domain layer | 6 | Types, `TaskManager` (CRUD, filter, sort, columns), mock data |
| Kanban board | 10 | Board, column, card components, HTML5 DnD, empty states, badges |
| List view | 6 | Table, header sort, filters, row actions, overdue styling |
| Task modal | 8 | Create/edit slide-over, validation, status/priority/tags/assignee pickers |
| App shell UI | 8 | Sidebar, topbar, breadcrumbs, tabs, filter bar, team avatars |
| Polish & UX | 4 | Avatars, overdue styling, delete confirm, design-only notice, `localStorage` persistence |
| Build & docs | 2 | `vue-tsc`, production build, README |

**Total: 48 hours**

---

## Tech Stack

- **Vue 3.5** (Composition API, `<script setup>`)
- **TypeScript 5.7**
- **Vite 6**
- No UI framework, state library, or drag-and-drop dependency

---

Questions or feedback: [mrayyan63151@gmail.com](mailto:mrayyan63151@gmail.com).
