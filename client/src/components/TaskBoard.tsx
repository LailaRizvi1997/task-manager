import React, { useState, useEffect } from 'react';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus, Search, Flame } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTaskStore } from '../store/taskStore';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { CategoryColumn } from './CategoryColumn';
import { CreateCategoryModal } from './CreateCategoryModal';
import { EODSummary } from './EODSummary';

export const TaskBoard: React.FC = () => {
  const { 
    categories, 
    tasks, 
    fetchCategories, 
    fetchTasks, 
    reorderTasks,
    getEODTasks,
    isLoading 
  } = useTaskStore();
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEODOnly, setShowEODOnly] = useState(false);
  
  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null;
  const eodTasks = getEODTasks();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    selectedTask,
    onTaskSelect: (task) => setSelectedTaskId(task?.id || null)
  });

  // Fetch data on mount
  useEffect(() => {
    fetchCategories();
    fetchTasks();
  }, [fetchCategories, fetchTasks]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTasks]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Get the source category tasks
    const sourceCategoryTasks = tasks.filter(
      task => task.categoryId === source.droppableId
    );

    // Create new task order
    const taskIds = Array.from(sourceCategoryTasks.map(t => t.id));
    
    // Remove dragged task from source position
    taskIds.splice(source.index, 1);
    
    // Insert at destination position
    taskIds.splice(destination.index, 0, draggableId);

    try {
      await reorderTasks(taskIds, destination.droppableId);
    } catch (error) {
      // Error handled in store
      console.error('Failed to reorder tasks:', error);
    }
  };

  const filteredCategories = categories.filter(category => {
    if (showEODOnly) {
      const categoryTasks = tasks.filter(t => t.categoryId === category.id);
      return categoryTasks.some(t => t.isEOD && !t.completed);
    }
    return true;
  });

  if (isLoading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-gray-600">
              Organize your work with End of Day priorities
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* EOD Filter */}
            <button
              onClick={() => setShowEODOnly(!showEODOnly)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
                {
                  'bg-red-600 text-white border-red-600': showEODOnly,
                  'bg-white text-gray-700 border-gray-300 hover:bg-gray-50': !showEODOnly,
                }
              )}
            >
              <Flame className="w-4 h-4" />
              <span>EOD Only</span>
              {eodTasks.length > 0 && (
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  {
                    'bg-white/20 text-white': showEODOnly,
                    'bg-red-100 text-red-800': !showEODOnly,
                  }
                )}>
                  {eodTasks.length}
                </span>
              )}
            </button>

            {/* Add Category */}
            <button
              onClick={() => setShowCreateCategory(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        {/* EOD Summary */}
        {eodTasks.length > 0 && (
          <EODSummary tasks={eodTasks} />
        )}

        {/* Keyboard Shortcuts Hint */}
        {selectedTaskId && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Selected task:</span>{' '}
              {selectedTask?.title} | 
              <span className="ml-2">
                <kbd className="px-2 py-1 bg-blue-100 rounded text-xs">Cmd/Ctrl+E</kbd> Toggle EOD |
                <kbd className="px-2 py-1 bg-blue-100 rounded text-xs ml-1">Enter</kbd> Complete |
                <kbd className="px-2 py-1 bg-blue-100 rounded text-xs ml-1">Esc</kbd> Deselect
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full p-6">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {showEODOnly ? 'No EOD tasks found' : 'No categories yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {showEODOnly 
                  ? 'Try removing the EOD filter or create some End of Day priority tasks.'
                  : 'Create your first category to start organizing your tasks.'
                }
              </p>
              {!showEODOnly && (
                <button
                  onClick={() => setShowCreateCategory(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Category
                </button>
              )}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex gap-6 pb-6">
                {filteredCategories.map((category) => (
                  <CategoryColumn
                    key={category.id}
                    category={category}
                    selectedTaskId={selectedTaskId || undefined}
                    onTaskSelect={(taskId) => setSelectedTaskId(taskId)}
                  />
                ))}
                
                {/* Add Category Card */}
                {!showEODOnly && (
                  <div className="w-80 flex-shrink-0">
                    <button
                      onClick={() => setShowCreateCategory(true)}
                      className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-gray-600">
                        <Plus className="w-8 h-8" />
                        <span className="font-medium">Add Category</span>
                        <span className="text-sm">Organize your tasks</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </DragDropContext>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateCategory && (
        <CreateCategoryModal
          onClose={() => setShowCreateCategory(false)}
        />
      )}
    </div>
  );
};