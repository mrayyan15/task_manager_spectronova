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

This runs `vue-tsc` for type checking, then `vite build`. Output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

No environment variables or external services are required. All task data is held in memory and seeded from mock data on load.

---

## Features

| Area | What works |
|------|------------|
| **Kanban** | Three default columns (To do, In Progress, Done), native HTML5 drag-and-drop between columns, per-column task counts, empty states, add-task per column |
| **List view** | Tabular layout with sort by due date or priority (toggle asc/desc), filter by priority and assignee |
| **Tasks** | Create, edit, and delete via modal; delete requires confirmation |
| **Overdue** | Tasks past their due date show a red date and warning icon when status is not Done (Kanban cards and list rows) |
| **View persistence** | Active view (Board / List), sort field/direction, and priority/assignee filters saved to `localStorage` |
| **Assignees** | Centralized `ASSIGNEES` roster; multi-select picker in task modal; filter lists all roster members; initials-based avatars with deterministic background colours |

---

## Architecture Overview

### Project structure

```
src/
├── main.ts                          # App bootstrap
├── App.vue                          # Root shell → TaskManager page
├── pages/
│   └── taskManager/
│       └── index.vue                # Page layout: sidebar, topbar, filters, view routing
├── components/taskManager/
│   ├── KanbanBoard.vue              # Horizontal board container
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
│   ├── types.ts                     # Task, Assignee, ASSIGNEES roster, FilterConfig, SortConfig, etc.
│   └── mockData.ts                  # Seed tasks
├── utils/
│   ├── badgeColors.ts               # Status/priority colour tokens
│   ├── colors.ts                    # Deterministic assignee avatar colours
│   ├── initials.ts                  # Name → initials
│   ├── designOnlyNotice.ts          # Shared state for assessment notice modal
│   └── deleteConfirm.ts             # Shared state for delete confirmation
└── styles/
    └── global.css                   # Design tokens, typography, utilities
```

### Component hierarchy

```
App.vue
└── pages/taskManager/index.vue          ← owns TaskManager instance + modal state
    ├── Sidebar / Topbar / Page chrome   ← mostly design-reference UI
    ├── ViewToggle ──────────────────────┐
    ├── Filter bar (priority, assignee)  │
    ├── KanbanBoard (v-if kanban)      │  all receive :manager="manager"
    │   └── KanbanColumn × N           │
    │       └── TaskCard × tasks       │
    ├── ListView (v-else)              │
    ├── TaskModal                      │
    ├── AssessmentNotice (global)      │
    └── DeleteConfirmModal (global)    ┘
```

The page component (`index.vue`) creates a single `TaskManager` instance and passes it down as a prop. Child components call methods like `manager.addTask()`, `manager.moveTo()`, and `manager.setFilter()` rather than mutating task data directly. Modal open/close state stays in the page because it coordinates multiple children (board, list, modal).

Global modals (`AssessmentNotice`, `DeleteConfirmModal`) use small utility modules (`designOnlyNotice.ts`, `deleteConfirm.ts`) with shared `ref`s so any deep child can trigger them without prop-drilling callbacks through every layer.

### TaskManager design

`TaskManager` is a plain TypeScript class whose `state` is wrapped in Vue's `reactive()`. This gives a single source of truth for tasks, columns, filters, sort, and active view without Pinia or Vuex.

**Responsibilities:**

- **CRUD:** `addTask`, `updateTask`, `deleteTask`, `moveTo`
- **Query:** `getTasks()` and `getTasksByStatus()` apply filter → sort pipeline before returning
- **Presentation rules:** `isOverdue`, `formatDueDate`, `getStatusBadgeMeta`, `getPriorityBadgeMeta` (shared by Kanban cards and list rows)
- **View:** `toggleView` persists Board/List choice to `localStorage`
- **Filters:** priority and assignee (including an explicit "unassigned" sentinel); persisted via `setFilter`
- **Sort:** due date (lexicographic on ISO strings) or priority (ranked low < medium < high); persisted via `setSort`

`types.ts` uses discriminated unions for `SortConfig` (field-driven) and `TaskModalMode` (`create` | `edit` | `closed`). Type guards (`isEditModalMode`, `isSortField`, etc.) narrow these at call sites.

Components read `manager.state` via `computed()` and re-render automatically when state changes. The class stays framework-agnostic enough to unit test without mounting Vue components.

### Trade-offs

| Choice | Benefit | Cost |
|--------|---------|------|
| **Reactive class instead of Pinia** | Minimal dependencies, clear BLL boundary, easy to reason about for a scoped app | No devtools time-travel; would not scale to many stores or SSR without adaptation |
| **Prop-drilled `manager` instead of `provide/inject`** | Explicit data flow visible in every component signature | Verbose props on intermediate components; acceptable at this depth |
| **Native HTML5 drag-and-drop** | Zero extra libraries, works for column-to-column moves | No smooth reordering within a column, limited touch support, no drag preview customisation |
| **In-memory mock data** | Fast to build and demo; no API contract to maintain | Refresh loses changes; no multi-user or persistence beyond view preference |
| **Design shell kept in page component** | Matches reference layout in one place | `index.vue` is large; sidebar/topbar would be extracted into layout components with more time |
| **Centralized roster, comma-separated task storage** | One `ASSIGNEES` list drives the modal picker and filter dropdown; task model stays a simple string | Tasks store comma-separated names, not assignee IDs; roster is static in code, not API-backed |

---

## Design Decisions

### 1. Initials-only assignee avatars (no RoboHash or Gravatar)

**What:** `Assignee` records (`id`, `name`) live in a canonical `ASSIGNEES` roster in `types.ts`. The task modal offers a multi-select dropdown from that roster; filters list every roster member plus an unassigned option. `AssigneeAvatar` renders one or two uppercase initials on a deterministic background colour derived from the assignee name hash. Kanban cards show stacked initials for multi-assignee tasks; the list view uses the shared avatar component.

**Why:** External avatar services add network dependency, privacy considerations, and visual inconsistency when names do not resolve. Initials are instant, work offline, and stay readable at small sizes (24–40 px). Deterministic colours keep the same person visually consistent across the app. A fixed roster avoids typos and keeps filters aligned with who can be assigned.

**With more time:** Add optional `avatarUrl` with uploaded images and initials fallback, persist assignee IDs on tasks instead of comma-separated names, and load the roster from an API.

### 2. Design-only notice modal for non-assessment UI

**What:** Sidebar links (Dashboard, Inbox, Calendar, Docs, etc.), notifications, table/timeline tabs, and decorative card footer stats (comments, links, subtasks) open an `AssessmentNotice` modal explaining the control is design reference only.

**Why:** The brief included a full product shell. Implementing every nav destination would dilute effort from core task flows. A single, consistent modal sets clear reviewer expectations: the shell is intentional visual context, not broken functionality.

**With more time:** Either wire routes for each section or visually dim non-functional controls (reduced opacity, `cursor: not-allowed`) so users discover scope before clicking. A one-time onboarding tooltip could replace repeated modal interruptions.

### 3. Delete confirmation via a dedicated modal (not `window.confirm`)

**What:** Deleting a task from a Kanban card or list row opens `DeleteConfirmModal`, an accessible `alertdialog` naming the task title, with Cancel and Delete actions.

**Why:** Native `confirm()` blocks the main thread, cannot be styled, and fails basic UX/accessibility expectations in a polished UI. A shared modal module keeps delete logic in `TaskManager` while letting any component trigger confirmation through `openDeleteConfirm(task, manager)`.

**With more time:** Add undo via a toast ("Task deleted · Undo") with a five-second window, and soft-delete with an archive column instead of immediate removal.

### 4. Overdue styling only for incomplete tasks

**What:** When `dueDate` is before today and `status !== 'done'`, the due date renders in red (`text-overdue`) with a warning triangle icon. Completed tasks never show overdue styling regardless of date.

**Why:** An overdue label on done work is noise. The rule matches how teams actually triage: overdue is an action signal for work still open.

**With more time:** Add a "due soon" amber state (e.g. within 48 hours), relative labels ("2 days ago"), and timezone-aware comparison instead of local-midnight date parsing.

---

## Known Limitations

### Incomplete or design-only UI

The following are rendered but **not functional** (they open the design-only notice modal or do nothing):

- Sidebar: Dashboard, Inbox, Calendar, Docs, Meeting, Settings, Support, profile menu, add team space
- Topbar: search filters tasks; back navigation, help, and notifications are design-only
- Page header: Invite Member, Share, team member overflow (+2)
- Tabs: Overview, Table, Timeline (only Board and List work)
- Toolbar: Group by, Sort (toolbar buttons; sorting works inside List view only)
- Kanban: Column options menu
- Task card footer: Comments, Links, Subtasks counts (deterministic decoration from task id hash, not real data)

### Data and persistence

- Tasks live in memory; **refresh resets task CRUD changes** but Board/List view, sort, and filters are restored from `localStorage`.
- No backend, authentication, or real-time sync.

### Behavioural compromises

- **Drag-and-drop:** Moves change status only; cannot reorder cards within a column.
- **Assignees:** Selected from the fixed `ASSIGNEES` roster in the modal and filters; tasks still store a comma-separated names string internally (not assignee IDs).
- **Filters:** Priority, assignee, and text search (title, description, tags, assignee); no tag-only filter or date range.
- **Sort:** Shared sort state between Kanban columns and list view; Kanban applies sort within each column.
- **Responsive:** Layout targets desktop; sidebar does not collapse on narrow viewports.
- **Accessibility:** Modals support basic ARIA roles; full keyboard drag-and-drop and focus trapping were not exhaustively tested.

### Assumptions where the spec was ambiguous

- **Default columns** are fixed at three (`todo`, `in-progress`, `done`) matching the design; `TaskStatus` is typed as `string` to allow future custom columns without a schema migration.
- **"Done" means not overdue:** `done` status suppresses overdue highlighting.
- **Multi-assignee selection** uses the in-app roster; persisted task data is comma-separated names (e.g. `"Davis Donin, Talan Korsgaard"`), not IDs.
- **Due dates** are ISO date strings (`YYYY-MM-DD`) interpreted in the user's local timezone at midnight.
- **Sort and filter persistence:** list sort (field + direction) and priority/assignee filters are saved to `localStorage` and restored on load; task data itself is not persisted.
- **Assessment scope** prioritised Kanban + List + CRUD over Table/Timeline views and full app navigation.

---

## Time Log (48 hours)

Rough breakdown of how the 48-hour assessment window was spent:

| Phase | Hours | Activities |
|-------|------:|------------|
| **Planning & setup** | 4 | Read brief and design reference, scaffold Vite + Vue 3 + TypeScript, define folder structure (`BLL/`, `components/`, `pages/`), establish CSS design tokens |
| **Domain layer** | 6 | `Task`/`FilterConfig`/`SortConfig` types, `TaskManager` class (CRUD, filter, sort, view toggle), mock seed data |
| **Kanban board** | 10 | `KanbanBoard`, `KanbanColumn`, `TaskCard`, HTML5 drag-and-drop, column empty states, status badges, priority chips |
| **List view** | 6 | Table layout, column header sort, priority/assignee filter integration, row actions, overdue column styling |
| **Task modal** | 8 | Create/edit slide-over, form validation, status and priority pickers, tags and assignee multi-select from roster, wired to `TaskManager` |
| **App shell UI** | 8 | Sidebar, topbar, breadcrumbs, page header, tabs, filter bar, team avatars, footer per design reference |
| **Polish & UX** | 4 | `AssigneeAvatar` initials, overdue red date + warning icon, delete confirm modal, design-only notice modal, view `localStorage` persistence, card hover delete, transitions |
| **Build verification & README** | 2 | `vue-tsc` + production build, documentation |

**Total: 48 hours**

---

## Tech Stack

- **Vue 3.5** (Composition API, `<script setup>`)
- **TypeScript 5.7**
- **Vite 6**
- No UI framework, state library, or drag-and-drop dependency

---

Thank you for reviewing this project. If you have questions or feedback, reach out at [mrayyan63151@gmail.com](mailto:mrayyan63151@gmail.com).
