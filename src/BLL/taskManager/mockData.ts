import type { Task } from './types';
import { ASSIGNEES, formatAssigneeNames } from './types';

function assigneeName(id: string): string {
  const person = ASSIGNEES.find((item) => item.id === id);
  if (!person) {
    throw new Error(`Unknown assignee id: ${id}`);
  }
  return person.name;
}

function assignees(...ids: string[]): string {
  return formatAssigneeNames(ids.map(assigneeName));
}

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Design Homepage Wireframe',
    description:
      'Create low-fidelity wireframes for the marketing homepage, covering hero, feature grid, and CTA sections for stakeholder review.',
    priority: 'high',
    dueDate: '2026-06-10',
    assignee: assignees('davis-donin', 'talan-korsgaard'),
    status: 'todo',
    tags: ['ux', 'backend'],
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'task-002',
    title: 'Implement OAuth2 Login Flow',
    description:
      'Integrate third-party OAuth providers and handle token refresh, session persistence, and error states in the auth module.',
    priority: 'medium',
    dueDate: '2026-05-28',
    assignee: assignees('talan-korsgaard', 'maya-chen', 'jordan-patel'),
    status: 'in-progress',
    tags: ['auth', 'blocked'],
    createdAt: '2026-04-15T14:30:00.000Z',
  },
  {
    id: 'task-003',
    title: 'Migrate User Service to REST API',
    description:
      'Replace legacy RPC endpoints with RESTful routes for user CRUD operations and update the API gateway configuration.',
    priority: 'high',
    dueDate: '2026-06-25',
    assignee: assignees('maya-chen', 'davis-donin'),
    status: 'todo',
    tags: ['backend', 'auth'],
    createdAt: '2026-05-20T11:15:00.000Z',
  },
  {
    id: 'task-004',
    title: 'Add Pagination to Task List Endpoint',
    description:
      'Introduce cursor-based pagination on the tasks API with configurable page size and total-count response headers.',
    priority: 'low',
    dueDate: '2026-08-15',
    assignee: assignees('jordan-patel'),
    status: 'in-progress',
    tags: ['backend'],
    createdAt: '2026-06-10T08:45:00.000Z',
  },
  {
    id: 'task-005',
    title: 'Refine Onboarding Tooltip Copy',
    description:
      'Update first-run tooltip text across the dashboard to align with the new product positioning and tone guidelines.',
    priority: 'medium',
    dueDate: '2026-06-01',
    assignee: assignees('davis-donin'),
    status: 'done',
    tags: ['ux'],
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'task-006',
    title: 'Write Unit Tests for Date Utilities',
    description:
      'Cover edge cases for timezone conversion, ISO parsing, and relative date formatting in the shared date helper module.',
    priority: 'low',
    dueDate: '2026-05-10',
    assignee: assignees('talan-korsgaard'),
    status: 'done',
    tags: [],
    createdAt: '2026-03-18T16:20:00.000Z',
  },
  {
    id: 'task-007',
    title: 'Audit Accessibility on Settings Page',
    description:
      'Run axe-core scans and manual keyboard navigation tests on the settings page; file tickets for WCAG 2.1 AA violations.',
    priority: 'low',
    dueDate: '2026-09-01',
    assignee: assignees('maya-chen'),
    status: 'todo',
    tags: [],
    createdAt: '2026-06-22T13:00:00.000Z',
  },
  {
    id: 'task-008',
    title: 'Resolve SSO Certificate Expiry',
    description:
      'Rotate the expiring SAML signing certificate and coordinate with IT to update the identity provider metadata.',
    priority: 'high',
    dueDate: '2026-07-20',
    assignee: assignees('jordan-patel', 'talan-korsgaard', 'maya-chen'),
    status: 'in-progress',
    tags: ['auth', 'blocked'],
    createdAt: '2026-06-28T09:30:00.000Z',
  },
  {
    id: 'task-009',
    title: 'Ship v2.1 Release Notes',
    description:
      'Draft and publish release notes covering new Kanban view, filter improvements, and breaking API changes for integrators.',
    priority: 'high',
    dueDate: '2026-04-15',
    assignee: assignees('davis-donin'),
    status: 'done',
    tags: ['backend'],
    createdAt: '2026-03-25T12:00:00.000Z',
  },
  {
    id: 'task-010',
    title: 'Investigate Slow Dashboard Load',
    description:
      'Profile initial page load on the analytics dashboard and identify N+1 queries or oversized bundle chunks causing latency.',
    priority: 'medium',
    dueDate: '2026-07-25',
    assignee: '',
    status: 'todo',
    tags: ['backend', 'blocked'],
    createdAt: '2026-06-30T15:45:00.000Z',
  },
  {
    id: 'task-011',
    title: 'Update Component Library Tokens',
    description:
      'Sync design tokens for spacing, color, and typography from Figma into the shared UI kit and regenerate CSS variables.',
    priority: 'medium',
    dueDate: '2026-08-01',
    assignee: '',
    status: 'in-progress',
    tags: ['ux'],
    createdAt: '2026-07-02T10:10:00.000Z',
  },
  {
    id: 'task-012',
    title: 'Document Webhook Retry Policy',
    description:
      'Add developer docs describing webhook delivery guarantees, exponential backoff intervals, and dead-letter queue behavior.',
    priority: 'low',
    dueDate: '2026-10-01',
    assignee: assignees('talan-korsgaard'),
    status: 'todo',
    tags: [],
    createdAt: '2026-07-05T08:00:00.000Z',
  },
];

export { mockTasks };
