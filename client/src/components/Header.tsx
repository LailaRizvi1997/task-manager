import React, { useState } from 'react';
import { Bell, Settings, LogOut, User, Flame, Menu, X } from 'lucide-react';
// import { cn } from '../utils/cn';
import { useAuthStore } from '../store/authStore';
import { useTaskStore } from '../store/taskStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { getEODTasks } = useTaskStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const eodTasks = getEODTasks();
  const eodCount = eodTasks.length;

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Task Manager
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Organize with EOD priorities
                </p>
              </div>
            </div>
          </div>

          {/* EOD Counter */}
          {eodCount > 0 && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
              <Flame className="w-4 h-4 text-red-600 animate-pulse" />
              <span className="text-sm font-medium text-red-900">
                {eodCount} EOD task{eodCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile EOD Counter */}
            {eodCount > 0 && (
              <div className="sm:hidden flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-200 rounded-full">
                <Flame className="w-3 h-3 text-red-600" />
                <span className="text-xs font-medium text-red-900">
                  {eodCount}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
              <Bell className="w-5 h-5" />
              {eodCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || user?.email}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // TODO: Open settings modal
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    
                    <hr className="my-1" />
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            {eodCount > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600 animate-pulse" />
                  <span className="text-sm font-medium text-red-900">
                    {eodCount} EOD task{eodCount !== 1 ? 's' : ''} pending
                  </span>
                </div>
              </div>
            )}
            
            <nav className="space-y-1">
              <a
                href="#"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Statistics
              </a>
              <a
                href="#"
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Settings
              </a>
            </nav>
          </div>
        </div>
      )}
      
      {/* Backdrop for mobile menu */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};