import React from 'react';
import { Flame, Clock, AlertTriangle } from 'lucide-react';
import { format, differenceInHours, isToday } from 'date-fns';
import { cn } from '../utils/cn';
import type { Task } from '../types';

interface EODSummaryProps {
  tasks: Task[];
}

export const EODSummary: React.FC<EODSummaryProps> = ({ tasks }) => {
  const totalEOD = tasks.length;
  const todayEOD = tasks.filter(task => 
    task.eodSetAt && isToday(new Date(task.eodSetAt))
  );
  const overdueEOD = tasks.filter(task => {
    if (!task.eodSetAt) return false;
    const setDate = new Date(task.eodSetAt);
    return !isToday(setDate) && differenceInHours(new Date(), setDate) > 24;
  });

  if (totalEOD === 0) return null;

  const getUrgencyLevel = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 16) return 'critical'; // After 4 PM
    if (currentHour >= 14) return 'warning'; // After 2 PM
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-all duration-300',
      {
        'bg-red-50 border-red-200': urgencyLevel === 'critical',
        'bg-orange-50 border-orange-200': urgencyLevel === 'warning',
        'bg-blue-50 border-blue-200': urgencyLevel === 'normal',
      }
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'p-2 rounded-full',
            {
              'bg-red-100': urgencyLevel === 'critical',
              'bg-orange-100': urgencyLevel === 'warning',
              'bg-blue-100': urgencyLevel === 'normal',
            }
          )}>
            <Flame className={cn(
              'w-5 h-5',
              {
                'text-red-600 animate-pulse': urgencyLevel === 'critical',
                'text-orange-600': urgencyLevel === 'warning',
                'text-blue-600': urgencyLevel === 'normal',
              }
            )} />
          </div>
          
          <div>
            <h3 className={cn(
              'font-semibold',
              {
                'text-red-900': urgencyLevel === 'critical',
                'text-orange-900': urgencyLevel === 'warning',
                'text-blue-900': urgencyLevel === 'normal',
              }
            )}>
              End of Day Tasks
            </h3>
            <p className={cn(
              'text-sm',
              {
                'text-red-700': urgencyLevel === 'critical',
                'text-orange-700': urgencyLevel === 'warning',
                'text-blue-700': urgencyLevel === 'normal',
              }
            )}>
              {totalEOD} task{totalEOD !== 1 ? 's' : ''} need{totalEOD === 1 ? 's' : ''} completion by end of day
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Today's EOD */}
          <div className="text-center">
            <div className={cn(
              'text-lg font-bold',
              {
                'text-red-900': urgencyLevel === 'critical',
                'text-orange-900': urgencyLevel === 'warning',
                'text-blue-900': urgencyLevel === 'normal',
              }
            )}>
              {todayEOD.length}
            </div>
            <div className={cn(
              'text-xs',
              {
                'text-red-600': urgencyLevel === 'critical',
                'text-orange-600': urgencyLevel === 'warning',
                'text-blue-600': urgencyLevel === 'normal',
              }
            )}>
              Today
            </div>
          </div>

          {/* Overdue EOD */}
          {overdueEOD.length > 0 && (
            <div className="text-center">
              <div className="text-lg font-bold text-red-700">
                {overdueEOD.length}
              </div>
              <div className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </div>
            </div>
          )}

          {/* Time indicator */}
          <div className="text-right">
            <div className={cn(
              'text-sm font-medium',
              {
                'text-red-700': urgencyLevel === 'critical',
                'text-orange-700': urgencyLevel === 'warning',
                'text-blue-700': urgencyLevel === 'normal',
              }
            )}>
              {format(new Date(), 'h:mm a')}
            </div>
            <div className={cn(
              'text-xs flex items-center gap-1',
              {
                'text-red-600': urgencyLevel === 'critical',
                'text-orange-600': urgencyLevel === 'warning',
                'text-blue-600': urgencyLevel === 'normal',
              }
            )}>
              <Clock className="w-3 h-3" />
              {urgencyLevel === 'critical' && 'Time running out!'}
              {urgencyLevel === 'warning' && 'Afternoon reminder'}
              {urgencyLevel === 'normal' && 'Plenty of time'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          💡 <strong>Pro tip:</strong> Use <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Cmd/Ctrl + E</kbd> to quickly toggle EOD status
        </div>
        
        {urgencyLevel === 'critical' && (
          <div className="flex items-center gap-2 text-red-700 text-sm font-medium animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            Focus on EOD tasks now!
          </div>
        )}
      </div>
    </div>
  );
};