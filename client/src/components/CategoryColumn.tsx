import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Category } from '../types';
import { useTaskStore } from '../store/taskStore';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';

interface CategoryColumnProps {
  category: Category;
  selectedTaskId?: string;
  onTaskSelect: (taskId: string | null) => void;
}

export const CategoryColumn: React.FC<CategoryColumnProps> = ({
  category,
  selectedTaskId,
  onTaskSelect
}) => {
  const { getTasksByCategory, deleteCategory } = useTaskStore();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const tasks = getTasksByCategory(category.id);
  const eodTasks = tasks.filter(task => task.isEOD && !task.completed);
  const regularTasks = tasks.filter(task => !task.isEOD && !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleDeleteCategory = async () => {
    if (tasks.length > 0) {
      alert('Cannot delete category with tasks. Please move or delete all tasks first.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  const renderTask = (task: any, index: number) => (
    <Draggable key={task.id} draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-3"
        >
          <TaskCard
            task={task}
            isDragging={snapshot.isDragging}
            isSelected={selectedTaskId === task.id}
            onClick={() => onTaskSelect(task.id)}
            onDoubleClick={() => setShowTaskModal(true)}
          />
        </div>
      )}
    </Draggable>
  );

  return (
    <div className="bg-gray-50 rounded-lg p-4 min-h-[200px] w-80 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <h3 className="font-semibold text-gray-900">{category.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
            {tasks.filter(t => !t.completed).length}
          </span>
          {eodTasks.length > 0 && (
            <span className="text-xs text-white bg-red-600 px-2 py-1 rounded-full animate-pulse">
              {eodTasks.length} EOD
            </span>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
              <button
                onClick={() => {
                  setShowMenu(false);
                  // TODO: Implement edit category
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  handleDeleteCategory();
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 w-full text-left text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {category.description && (
        <p className="text-xs text-gray-600 mb-4">{category.description}</p>
      )}

      {/* Tasks */}
      <Droppable droppableId={category.id} type="task">
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'min-h-[100px] transition-colors duration-200',
              {
                'bg-blue-50 rounded-lg': snapshot.isDraggingOver,
              }
            )}
          >
            {/* EOD Tasks Section */}
            {eodTasks.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                    🔥 End of Day
                  </h4>
                </div>
                {eodTasks.map((task, index) => renderTask(task, index))}
              </div>
            )}

            {/* Regular Tasks */}
            {regularTasks.length > 0 && (
              <div className="mb-4">
                {eodTasks.length > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Regular Tasks
                    </h4>
                  </div>
                )}
                {regularTasks.map((task, index) => renderTask(task, eodTasks.length + index))}
              </div>
            )}

            {/* Completed Tasks (collapsed) */}
            {completedTasks.length > 0 && (
              <details className="mb-4">
                <summary className="text-xs font-semibold text-gray-400 uppercase tracking-wide cursor-pointer mb-2">
                  ✓ Completed ({completedTasks.length})
                </summary>
                <div className="ml-2">
                  {completedTasks.map((task, index) => renderTask(task, eodTasks.length + regularTasks.length + index))}
                </div>
              </details>
            )}

            {provided.placeholder}
            
            {/* Empty State */}
            {tasks.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs mt-1">Create your first task below</p>
              </div>
            )}
          </div>
        )}
      </Droppable>

      {/* Add Task Button */}
      <button
        onClick={() => setShowCreateTask(true)}
        className="w-full mt-4 p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-100 transition-colors group"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500 group-hover:text-gray-600">
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add Task</span>
        </div>
      </button>

      {/* Modals */}
      {showTaskModal && selectedTaskId && (
        <TaskModal
          taskId={selectedTaskId}
          onClose={() => setShowTaskModal(false)}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          categoryId={category.id}
          onClose={() => setShowCreateTask(false)}
        />
      )}
    </div>
  );
};