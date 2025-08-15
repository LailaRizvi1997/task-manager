// Re-export types from shared package
export interface User {
  id: string;
  email: string;
  name?: string;
  timezone: string;
  eodReminderTime?: string;
  weekendEOD: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  position: number;
  color: string;
  icon?: string;
  userId: string;
  isArchived: boolean;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  color: string;
  isEOD: boolean;
  eodSetAt?: string;
  eodCompletedAt?: string;
  completed: boolean;
  completedAt?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    color: string;
  };
  userId: string;
  subtasks?: Subtask[];
  attachments?: Attachment[];
  dueDate?: string;
  reminder?: string;
  notes?: string;
  _count?: {
    subtasks: number;
    attachments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  taskId: string;
  uploadedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  message?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  categoryId: string;
  priority?: number;
  color?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: number;
  color?: string;
  completed?: boolean;
  isEOD?: boolean;
  dueDate?: string;
  notes?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  categoriesCount: number;
}

export interface EODStats {
  totalEOD: number;
  completedEOD: number;
  pendingEOD: number;
  overdueEOD: number;
  eodCompletionRate: number;
}