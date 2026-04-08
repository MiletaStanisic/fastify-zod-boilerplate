import { randomUUID } from "node:crypto";
import type {
  ActivityEvent,
  Client,
  Project,
  ProjectTask,
} from "../types/index.js";

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

function daysFromNow(n: number): string {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

const seedClients: Client[] = [
  {
    id: "client-1",
    name: "Acme Corp",
    email: "contact@acme.example",
    phone: "+1-555-0100",
    createdAt: daysAgo(30),
  },
  {
    id: "client-2",
    name: "Globex Solutions",
    email: "hello@globex.example",
    createdAt: daysAgo(15),
  },
];

const seedProjects: Project[] = [
  {
    id: "proj-1",
    clientId: "client-1",
    name: "Website Redesign",
    description: "Full redesign of the corporate website",
    status: "in_progress",
    dueDate: daysFromNow(14),
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
  },
  {
    id: "proj-2",
    clientId: "client-1",
    name: "Mobile App MVP",
    description: "React Native app for customer portal",
    status: "backlog",
    createdAt: daysAgo(10),
    updatedAt: daysAgo(10),
  },
  {
    id: "proj-3",
    clientId: "client-2",
    name: "Brand Identity",
    description: "Logo, colour palette, and style guide",
    status: "review",
    dueDate: daysFromNow(3),
    createdAt: daysAgo(25),
    updatedAt: daysAgo(1),
  },
  {
    id: "proj-4",
    clientId: "client-2",
    name: "SEO Audit",
    status: "done",
    createdAt: daysAgo(45),
    updatedAt: daysAgo(5),
  },
  {
    id: "proj-5",
    clientId: "client-1",
    name: "E-commerce Integration",
    description: "Blocked on client payment gateway access",
    status: "blocked",
    dueDate: daysAgo(2),
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
  },
];

const seedTasks: ProjectTask[] = [
  // proj-1
  {
    id: "task-1",
    projectId: "proj-1",
    title: "Wireframes",
    done: true,
    createdAt: daysAgo(18),
    updatedAt: daysAgo(12),
  },
  {
    id: "task-2",
    projectId: "proj-1",
    title: "Design system setup",
    done: true,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(8),
  },
  {
    id: "task-3",
    projectId: "proj-1",
    title: "Homepage implementation",
    done: false,
    dueDate: daysFromNow(5),
    createdAt: daysAgo(10),
    updatedAt: daysAgo(1),
  },
  {
    id: "task-4",
    projectId: "proj-1",
    title: "SEO metadata",
    done: false,
    dueDate: daysAgo(1),
    createdAt: daysAgo(8),
    updatedAt: daysAgo(2),
  },
  // proj-2
  {
    id: "task-5",
    projectId: "proj-2",
    title: "Define user stories",
    done: false,
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
  },
  // proj-3
  {
    id: "task-6",
    projectId: "proj-3",
    title: "Logo concepts",
    done: true,
    createdAt: daysAgo(22),
    updatedAt: daysAgo(5),
  },
  {
    id: "task-7",
    projectId: "proj-3",
    title: "Client review round 2",
    done: false,
    dueDate: daysFromNow(2),
    createdAt: daysAgo(3),
    updatedAt: daysAgo(1),
  },
  // proj-5
  {
    id: "task-8",
    projectId: "proj-5",
    title: "Obtain API credentials",
    done: false,
    dueDate: daysAgo(3),
    createdAt: daysAgo(28),
    updatedAt: daysAgo(5),
  },
];

function makeSeedActivity(): ActivityEvent[] {
  return [
    {
      id: randomUUID(),
      type: "client_created",
      description: "Client 'Acme Corp' was added",
      entityId: "client-1",
      createdAt: daysAgo(30),
    },
    {
      id: randomUUID(),
      type: "project_created",
      description: "Project 'Website Redesign' was created",
      entityId: "proj-1",
      projectId: "proj-1",
      createdAt: daysAgo(20),
    },
    {
      id: randomUUID(),
      type: "project_status_changed",
      description: "Project 'Website Redesign' moved to in_progress",
      entityId: "proj-1",
      projectId: "proj-1",
      createdAt: daysAgo(18),
    },
    {
      id: randomUUID(),
      type: "task_created",
      description: "Task 'Wireframes' was created",
      entityId: "task-1",
      projectId: "proj-1",
      createdAt: daysAgo(18),
    },
    {
      id: randomUUID(),
      type: "task_completed",
      description: "Task 'Wireframes' was completed",
      entityId: "task-1",
      projectId: "proj-1",
      createdAt: daysAgo(12),
    },
    {
      id: randomUUID(),
      type: "client_created",
      description: "Client 'Globex Solutions' was added",
      entityId: "client-2",
      createdAt: daysAgo(15),
    },
    {
      id: randomUUID(),
      type: "project_created",
      description: "Project 'Brand Identity' was created",
      entityId: "proj-3",
      projectId: "proj-3",
      createdAt: daysAgo(25),
    },
    {
      id: randomUUID(),
      type: "task_created",
      description: "Task 'Logo concepts' was created",
      entityId: "task-6",
      projectId: "proj-3",
      createdAt: daysAgo(22),
    },
    {
      id: randomUUID(),
      type: "task_completed",
      description: "Task 'Logo concepts' was completed",
      entityId: "task-6",
      projectId: "proj-3",
      createdAt: daysAgo(5),
    },
    {
      id: randomUUID(),
      type: "project_status_changed",
      description: "Project 'SEO Audit' moved to done",
      entityId: "proj-4",
      projectId: "proj-4",
      createdAt: daysAgo(5),
    },
  ];
}

export type Store = {
  clients: Client[];
  projects: Project[];
  tasks: ProjectTask[];
  activityFeed: ActivityEvent[];
};

export function createStore(): Store {
  return {
    clients: [...seedClients],
    projects: [...seedProjects],
    tasks: [...seedTasks],
    activityFeed: makeSeedActivity(),
  };
}
