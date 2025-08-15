import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';

interface UseKeyboardShortcutsProps {
  selectedTask?: Task | null;
  onTaskSelect?: (task: Task | null) => void;
}

export const useKeyboardShortcuts = ({
  selectedTask,
  onTaskSelect
}: UseKeyboardShortcutsProps = {}) => {
  const { toggleTaskEOD, toggleTaskComplete, deleteTask } = useTaskStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const metaKey = isMac ? event.metaKey : event.ctrlKey;

      // Global shortcuts
      if (metaKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        if (selectedTask) {
          toggleTaskEOD(selectedTask.id);
        }
        return;
      }

      // Task-specific shortcuts (require selected task)
      if (!selectedTask) return;

      switch (event.key.toLowerCase()) {
        case 'enter':
          event.preventDefault();
          toggleTaskComplete(selectedTask.id);
          break;
          
        case 'delete':
        case 'backspace':
          if (metaKey) {
            event.preventDefault();
            deleteTask(selectedTask.id);
            onTaskSelect?.(null);
          }
          break;
          
        case 'e':
          if (!metaKey) {
            event.preventDefault();
            toggleTaskEOD(selectedTask.id);
          }
          break;
          
        case 'escape':
          event.preventDefault();
          onTaskSelect?.(null);
          break;
          
        // Priority shortcuts (1-5)
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          event.preventDefault();
          const priority = parseInt(event.key) - 1;
          // This would require updating task priority
          console.log(`Setting priority to ${priority} for task ${selectedTask.id}`);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedTask, toggleTaskEOD, toggleTaskComplete, deleteTask, onTaskSelect]);

  return {
    shortcuts: {
      toggleEOD: 'Cmd/Ctrl + E',
      complete: 'Enter',
      delete: 'Cmd/Ctrl + Delete',
      quickEOD: 'E',
      escape: 'Escape',
      priority: '1-5',
    }
  };
};