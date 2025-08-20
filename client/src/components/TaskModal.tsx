import React, { useState, useEffect } from 'react';
import { X, Calendar, Palette, Clock, CheckCircle2, Flame, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';
import { useTaskStore } from '../store/taskStore';
import type { UpdateTaskRequest } from '../types';

interface TaskModalProps {
  taskId: string;
  onClose: () => void;
}

const PRIORITY_COLORS = [
  { name: 'Default', value: '#ffffff' },
  { name: 'Low', value: '#22c55e' },
  { name: 'Medium', value: '#eab308' },
  { name: 'High', value: '#f97316' },
  { name: 'Critical', value: '#ef4444' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  taskId,
  onClose
}) => {
  const { tasks, updateTask, deleteTask, toggleTaskComplete, toggleTaskEOD } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const task = tasks.find(t => t.id === taskId);
  
  const [formData, setFormData] = useState<UpdateTaskRequest>({
    title: task?.title || '',
    description: task?.description || '',
    color: task?.color || '#ffffff',
    dueDate: task?.dueDate || '',
    notes: task?.notes || '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        color: task.color,
        dueDate: task.dueDate || '',
        notes: task.notes || '',
      });
    }
  }, [task]);

  if (!task) {
    return null;
  }

  const handleSave = async () => {
    if (!formData.title?.trim()) return;

    setIsLoading(true);
    
    try {
      await updateTask(taskId, {
        ...formData,
        title: formData.title?.trim(),
        description: formData.description?.trim() || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes?.trim() || undefined,
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
        onClose();
      } catch (error) {
        // Error handled in store
      }
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between p-6 border-b',
          {
            'bg-red-600 text-white': task.isEOD && !task.completed,
          }
        )}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleTaskComplete(taskId)}
              className={cn(
                'transition-colors duration-200',
                {
                  'text-green-400 hover:text-green-300': task.completed,
                  'text-gray-400 hover:text-green-400': !task.completed && !task.isEOD,
                  'text-white/80 hover:text-green-300': !task.completed && task.isEOD,
                }
              )}
            >
              <CheckCircle2 className="w-6 h-6" />
            </button>
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className={cn(
                    'text-lg font-semibold bg-transparent border-b-2 outline-none',
                    {
                      'text-white border-white/50 placeholder-white/70': task.isEOD,
                      'text-gray-900 border-gray-300': !task.isEOD,
                    }
                  )}
                  autoFocus
                />
              ) : (
                <h2 className={cn(
                  'text-lg font-semibold',
                  {
                    'line-through opacity-75': task.completed,
                  }
                )}>
                  {task.title}
                </h2>
              )}
              
              {task.category && (
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.category.color }}
                  />
                  <span className={cn(
                    'text-sm',
                    {
                      'text-white/90': task.isEOD,
                      'text-gray-600': !task.isEOD,
                    }
                  )}>
                    {task.category.name}
                  </span>
                </div>
              )}
            </div>

            {/* EOD Toggle */}
            <button
              onClick={() => toggleTaskEOD(taskId)}
              className={cn(
                'p-2 rounded-full transition-all duration-200',
                {
                  'bg-white/20 text-white': task.isEOD,
                  'bg-orange-100 text-orange-600 hover:bg-orange-200': !task.isEOD,
                }
              )}
              title={task.isEOD ? 'Remove EOD priority' : 'Mark as End of Day priority'}
            >
              {task.isEOD ? <Flame className="w-5 h-5" /> : '⏰'}
            </button>
          </div>
          
          <button
            onClick={onClose}
            className={cn(
              'hover:opacity-75 transition-opacity',
              {
                'text-white': task.isEOD,
                'text-gray-400': !task.isEOD,
              }
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add a description..."
              />
            ) : (
              <p className="text-gray-600 bg-gray-50 rounded-lg p-3 min-h-[80px]">
                {task.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              {isEditing ? (
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-600 bg-gray-50 rounded-lg p-3">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {task.dueDate 
                      ? format(new Date(task.dueDate), 'MMM d, yyyy \'at\' h:mm a')
                      : 'No due date set'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Priority Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Color
              </label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <div className="flex gap-2">
                    {PRIORITY_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => handleColorSelect(color.value)}
                        className={cn(
                          'w-8 h-8 rounded-full border-2 transition-all',
                          {
                            'border-gray-300': formData.color !== color.value,
                            'border-blue-500 ring-2 ring-blue-200': formData.color === color.value,
                          }
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="text-gray-600">
                    {PRIORITY_COLORS.find(c => c.value === task.color)?.name || 'Custom'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* EOD Information */}
          {task.isEOD && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-900">End of Day Priority</h3>
              </div>
              <div className="space-y-2 text-sm text-red-800">
                {task.eodSetAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      Set at {format(new Date(task.eodSetAt), 'h:mm a \'on\' MMM d')}
                    </span>
                  </div>
                )}
                {task.completed && task.eodCompletedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Completed at {format(new Date(task.eodCompletedAt), 'h:mm a \'on\' MMM d')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Add your notes here..."
              />
            ) : (
              <div className="text-gray-600 bg-gray-50 rounded-lg p-3 min-h-[100px] whitespace-pre-wrap">
                {task.notes || 'No notes added.'}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t text-sm text-gray-500">
            <div>
              <span className="font-medium">Created:</span>{' '}
              {format(new Date(task.createdAt), 'MMM d, yyyy \'at\' h:mm a')}
            </div>
            {task.completedAt && (
              <div>
                <span className="font-medium">Completed:</span>{' '}
                {format(new Date(task.completedAt), 'MMM d, yyyy \'at\' h:mm a')}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Task
          </button>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      title: task.title,
                      description: task.description || '',
                      color: task.color,
                      dueDate: task.dueDate || '',
                      notes: task.notes || '',
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.title?.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};