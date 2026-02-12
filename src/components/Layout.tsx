import { ReactNode } from 'react';
import { Home, Users, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Avatar } from './Avatar';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { profile, signOut } = useAuth();
  // const { theme, toggleTheme } = useTheme(); // Theme is now fixed to light

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Syfse Club</span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'home'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('communities')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  currentView === 'communities'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('create-post')}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </button>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-full"
              aria-label="Profile"
            >
              <Avatar url={profile?.avatar_url || null} size={8} username={profile?.username} />
              {profile?.username && (
                <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                  {profile.username}
                </span>
              )}
            </button>

            <button
              onClick={signOut}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
