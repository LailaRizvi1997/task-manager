import { create } from 'zustand';
import api from '../utils/api';
import { Task, Category, CreateTaskRequest, UpdateTaskRequest, CreateCategoryRequest } from '../types';
import { toast } from 'react-hot-toast';

interface TaskState {
  tasks: Task[];
  categories: Category[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: string, updates: UpdateTaskRequest) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskComplete: (id: string) => Promise<void>;
  toggleTaskEOD: (id: string) => Promise<void>;
  createCategory: (category: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  reorderTasks: (taskIds: string[], categoryId?: string) => Promise<void>;
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
  
  // Computed getters
  getTasksByCategory: (categoryId: string) => Task[];
  getEODTasks: () => Task[];
  getPendingTasks: () => Task[];
  getCompletedTasks: () => Task[];
}

export const useTaskStore = create<TaskState>()((set, get) => ({
  tasks: [],
  categories: [],
  selectedTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get<{ tasks: Task[] }>('/tasks');
      set({ 
        tasks: response.data.tasks, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch tasks',
        isLoading: false 
      });
    }
  },

  fetchCategories: async () => {
    set({ error: null });
    
    try {
      const response = await api.get<{ categories: Category[] }>('/categories');
      set({ categories: response.data.categories });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch categories' });
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ error: null });
    
    try {
      const response = await api.post<{ task: Task }>('/tasks', taskData);
      const newTask = response.data.task;
      
      set((state) => ({
        tasks: [...state.tasks, newTask]
      }));
      
      toast.success('Task created successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create task';
      set({ error: message });
      throw error;
    }
  },

  updateTask: async (id: string, updates: UpdateTaskRequest) => {
    set({ error: null });
    
    try {
      const response = await api.patch<{ task: Task }>(`/tasks/${id}`, updates);
      const updatedTask = response.data.task;
      
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask
      }));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update task';
      set({ error: message });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ error: null });
    
    try {
      await api.delete(`/tasks/${id}`);
      
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask
      }));
      
      toast.success('Task deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete task';
      set({ error: message });
      throw error;
    }
  },

  toggleTaskComplete: async (id: string) => {
    set({ error: null });
    
    try {
      const response = await api.patch<{ task: Task }>(`/tasks/${id}/complete`);
      const updatedTask = response.data.task;
      
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      }));
      
      if (updatedTask.completed) {
        toast.success('Task completed!');
        if (updatedTask.isEOD) {
          toast.success('EOD task completed! 🔥', { 
            duration: 3000,
            style: {
              background: '#dc2626',
              color: '#fff',
            }
          });
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to toggle task completion';
      set({ error: message });
      throw error;
    }
  },

  toggleTaskEOD: async (id: string) => {
    set({ error: null });
    
    try {
      const response = await api.patch<{ task: Task }>(`/tasks/${id}/eod`);
      const updatedTask = response.data.task;
      
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        )
      }));
      
      if (updatedTask.isEOD) {
        toast.success('Task marked as End of Day priority! 🔥', {
          duration: 2000,
          style: {
            background: '#dc2626',
            color: '#fff',
          }
        });
      } else {
        toast.success('EOD priority removed');
      }
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to toggle EOD status';
      set({ error: message });
      throw error;
    }
  },

  createCategory: async (categoryData: CreateCategoryRequest) => {
    set({ error: null });
    
    try {
      const response = await api.post<{ category: Category }>('/categories', categoryData);
      const newCategory = response.data.category;
      
      set((state) => ({
        categories: [...state.categories, newCategory]
      }));
      
      toast.success('Category created successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create category';
      set({ error: message });
      throw error;
    }
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    set({ error: null });
    
    try {
      const response = await api.patch<{ category: Category }>(`/categories/${id}`, updates);
      const updatedCategory = response.data.category;
      
      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? updatedCategory : category
        )
      }));
      
      toast.success('Category updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update category';
      set({ error: message });
      throw error;
    }
  },

  deleteCategory: async (id: string) => {
    set({ error: null });
    
    try {
      await api.delete(`/categories/${id}`);
      
      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id)
      }));
      
      toast.success('Category deleted successfully');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete category';
      set({ error: message });
      throw error;
    }
  },

  reorderTasks: async (taskIds: string[], categoryId?: string) => {
    set({ error: null });
    
    try {
      await api.patch('/tasks/reorder', { taskIds, categoryId });
      
      // Refetch tasks to get updated order
      get().fetchTasks();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to reorder tasks';
      set({ error: message });
      throw error;
    }
  },

  setSelectedTask: (task: Task | null) => set({ selectedTask: task }),
  
  clearError: () => set({ error: null }),

  // Computed getters
  getTasksByCategory: (categoryId: string) => {
    const { tasks } = get();
    return tasks
      .filter((task) => task.categoryId === categoryId)
      .sort((a, b) => {
        // EOD tasks first
        if (a.isEOD && !b.isEOD) return -1;
        if (!a.isEOD && b.isEOD) return 1;
        
        // Among EOD tasks, sort by when they were set
        if (a.isEOD && b.isEOD) {
          const aTime = a.eodSetAt ? new Date(a.eodSetAt).getTime() : 0;
          const bTime = b.eodSetAt ? new Date(b.eodSetAt).getTime() : 0;
          return aTime - bTime;
        }
        
        // Regular tasks by priority
        return a.priority - b.priority;
      });
  },

  getEODTasks: () => {
    const { tasks } = get();
    return tasks.filter((task) => task.isEOD && !task.completed);
  },

  getPendingTasks: () => {
    const { tasks } = get();
    return tasks.filter((task) => !task.completed);
  },

  getCompletedTasks: () => {
    const { tasks } = get();
    return tasks.filter((task) => task.completed);
  },
}));