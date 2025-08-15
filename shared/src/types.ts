// User types
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

// Category types
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

// Task types
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

// Notification types
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  userId: string;
  createdAt: string;
}

export enum NotificationType {
  EOD_REMINDER = 'EOD_REMINDER',
  TASK_DUE = 'TASK_DUE',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
  ACHIEVEMENT = 'ACHIEVEMENT',
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  message?: string;
}

// Task request types
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

// Category request types
export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
}

// Statistics types
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

export interface StatsResponse {
  summary: TaskStats;
  eod: EODStats;
}

export interface DailyStats {
  date: string;
  completed: number;
  eodCompleted: number;
  eodSet: number;
  eodCompletionRate: number;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  completed: number;
  eodCompleted: number;
  eodSet: number;
  eodCompletionRate: number;
}

export interface MonthlyStats {
  month: string;
  completed: number;
  eodCompleted: number;
  eodSet: number;
  eodCompletionRate: number;
}

export interface EODDetailedStats {
  totalEOD: number;
  completedEOD: number;
  pendingEOD: number;
  completionRate: number;
  averageCompletionTimeMinutes?: number;
  streakDays: number;
  range: string;
  period: {
    start: string;
    end: string;
  };
}

// Drag and Drop types
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// Filter and Sort types
export interface TaskFilters {
  categoryId?: string;
  isEOD?: boolean;
  completed?: boolean;
  search?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export interface TaskSortOption {
  field: 'title' | 'priority' | 'createdAt' | 'dueDate' | 'eodSetAt';
  direction: 'asc' | 'desc';
}

// UI State types
export interface AppState {
  user: User | null;
  categories: Category[];
  tasks: Map<string, Task[]>;
  selectedTask: Task | null;
  draggedTask: Task | null;
  isLoading: boolean;
  error: string | null;
}

// Theme types
export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Settings types
export interface UserSettings {
  timezone: string;
  eodReminderTime: string;
  weekendEOD: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    eodReminders: boolean;
    taskDue: boolean;
    dailySummary: boolean;
  };
}