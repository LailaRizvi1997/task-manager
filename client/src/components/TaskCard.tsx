import React from 'react';
import { Clock, CheckCircle2, Circle, Calendar, Flame } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { cn } from '../utils/cn';
import { Task } from '../types';
import { useTaskStore } from '../store/taskStore';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging = false,
  isSelected = false,
  onClick,
  onDoubleClick
}) => {
  const { toggleTaskComplete, toggleTaskEOD } = useTaskStore();

  const handleCompleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskComplete(task.id);
  };

  const handleEODClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTaskEOD(task.id);
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Today';
    return format(date, 'MMM d');
  };

  const isDueToday = task.dueDate ? isToday(new Date(task.dueDate)) : false;
  const isOverdue = task.dueDate ? isPast(new Date(task.dueDate)) && !task.completed : false;

  return (
    <div
      className={cn(
        'task-card group relative p-4 rounded-lg border cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:-translate-y-1',
        {
          'eod-task': task.isEOD && !task.completed,
          'opacity-50 line-through': task.completed,
          'opacity-60 rotate-1': isDragging,
          'ring-2 ring-blue-500 ring-offset-2': isSelected,
          'border-orange-300 bg-orange-50': isDueToday && !task.completed && !task.isEOD,
          'border-red-300 bg-red-50': isOverdue && !task.completed && !task.isEOD,
        }
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{
        backgroundColor: task.isEOD ? undefined : task.color,
        borderLeftWidth: '4px',
        borderLeftColor: task.category?.color || '#6b7280',
      }}
    >
      {/* EOD Indicator */}
      {task.isEOD && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-white">
          <Flame className="w-4 h-4 animate-flame" />
          <span className="text-xs font-bold">EOD</span>
        </div>
      )}

      {/* Completion Button */}
      <button
        onClick={handleCompleteClick}
        className={cn(
          'absolute top-3 left-3 transition-colors duration-200',
          {
            'text-green-600 hover:text-green-700': task.completed,
            'text-gray-400 hover:text-green-600 group-hover:text-green-500': !task.completed,
            'text-white hover:text-green-200': task.isEOD && !task.completed,
          }
        )}
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : (
          <Circle className="w-5 h-5" />
        )}
      </button>

      {/* Task Content */}
      <div className="ml-8">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              'font-medium text-sm',
              {
                'text-white': task.isEOD && !task.completed,
                'text-gray-900': !task.isEOD && !task.completed,
                'text-gray-500': task.completed,
              }
            )}>
              {task.title}
            </h3>
            
            {task.description && (
              <p className={cn(
                'mt-1 text-xs',
                {
                  'text-white/90': task.isEOD && !task.completed,
                  'text-gray-600': !task.isEOD && !task.completed,
                  'text-gray-400': task.completed,
                }
              )}>
                {task.description}
              </p>
            )}
          </div>

          {/* EOD Toggle Button */}
          <button
            onClick={handleEODClick}
            className={cn(
              'ml-2 p-1 rounded transition-colors duration-200',
              {
                'text-white hover:bg-red-500': task.isEOD,
                'text-orange-500 hover:bg-orange-100': !task.isEOD,
              }
            )}
            title={task.isEOD ? 'Remove EOD priority' : 'Mark as End of Day priority'}
          >
            {task.isEOD ? '🔥' : '⏰'}
          </button>
        </div>

        {/* Task Metadata */}
        <div className={cn(
          'flex items-center gap-3 mt-3 text-xs',
          {
            'text-white/80': task.isEOD && !task.completed,
            'text-gray-500': !task.isEOD,
          }
        )}>
          {/* Category */}
          {task.category && (
            <span
              className="px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: task.category.color + '20',
                color: task.category.color,
              }}
            >
              {task.category.name}
            </span>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              'flex items-center gap-1',
              {
                'text-orange-600': isDueToday && !task.completed,
                'text-red-600': isOverdue && !task.completed,
              }
            )}>
              <Calendar className="w-3 h-3" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {/* EOD Set Time */}
          {task.isEOD && task.eodSetAt && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>
                {format(new Date(task.eodSetAt), 'HH:mm')}
              </span>
            </div>
          )}

          {/* Subtasks Count */}
          {task._count?.subtasks && task._count.subtasks > 0 && (
            <span>
              {task.subtasks?.filter(s => s.completed).length || 0}/{task._count.subtasks} subtasks
            </span>
          )}
        </div>
      </div>

      {/* Drag Handle */}
      <div className={cn(
        'absolute right-2 bottom-2 opacity-0 group-hover:opacity-50 transition-opacity',
        'w-4 h-4 cursor-grab active:cursor-grabbing',
        {
          'text-white': task.isEOD && !task.completed,
          'text-gray-400': !task.isEOD,
        }
      )}>
        ⋮⋮
      </div>
    </div>
  );
};