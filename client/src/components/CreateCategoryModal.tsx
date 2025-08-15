import React, { useState } from 'react';
import { X, Palette, Hash } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTaskStore } from '../store/taskStore';
import { CreateCategoryRequest } from '../types';

interface CreateCategoryModalProps {
  onClose: () => void;
}

const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#6b7280', // gray
];

const CATEGORY_ICONS = [
  '📋', '💼', '🎯', '📊', '🚀', '💡', '⭐', '🔧', '📝', '🎨',
  '📱', '💻', '🏠', '🏃‍♂️', '📚', '🎵', '🍔', '✈️', '💰', '🎮'
];

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  onClose
}) => {
  const { createCategory } = useTaskStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryRequest>({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
    icon: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    setIsLoading(true);
    
    try {
      await createCategory({
        ...formData,
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      });
      onClose();
    } catch (error) {
      // Error handled in store
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleIconSelect = (icon: string) => {
    setFormData(prev => ({ ...prev, icon }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Create New Category</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Work Projects, Personal Tasks..."
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Optional description for this category..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Choose a color for your category</span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {CATEGORY_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={cn(
                    'w-10 h-10 rounded-lg border-2 transition-all hover:scale-110',
                    {
                      'border-gray-300': formData.color !== color,
                      'border-gray-800 ring-2 ring-gray-200': formData.color === color,
                    }
                  )}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon (Optional)
            </label>
            <div className="flex items-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">Pick an emoji to represent your category</span>
            </div>
            
            {/* Selected Icon Preview */}
            {formData.icon && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                <span className="text-2xl">{formData.icon}</span>
                <span className="text-sm text-gray-600">Selected icon</span>
                <button
                  type="button"
                  onClick={() => handleIconSelect('')}
                  className="ml-auto text-xs text-gray-500 hover:text-gray-700"
                >
                  Remove
                </button>
              </div>
            )}
            
            <div className="grid grid-cols-10 gap-1 max-h-24 overflow-y-auto">
              {CATEGORY_ICONS.map((icon, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleIconSelect(icon)}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-lg',
                    {
                      'bg-blue-100 ring-2 ring-blue-500': formData.icon === icon,
                    }
                  )}
                  title={icon}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="pt-4 border-t">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: formData.color }}
                />
                {formData.icon && <span className="text-sm">{formData.icon}</span>}
                <span className="font-medium text-gray-900">
                  {formData.name || 'Category Name'}
                </span>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  0
                </span>
              </div>
              {formData.description && (
                <p className="text-xs text-gray-600 mt-1">{formData.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};