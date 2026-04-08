export type ProjectStatus =
  | "backlog"
  | "in_progress"
  | "review"
  | "done"
  | "blocked";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ActivityEventType =
  | "client_created"
  | "project_created"
  | "project_status_changed"
  | "task_created"
  | "task_completed";

export interface ActivityEvent {
  id: string;
  projectId?: string;
  type: ActivityEventType;
  description: string;
  entityId: string;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
