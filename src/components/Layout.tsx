import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { Button } from './ui';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Syfse Club</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive('/') && location.pathname === '/'
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
              </Link>
              <Link
                to="/s"
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive('/s')
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/create">
              <Button size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Button>
            </Link>

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

            <Link
              to="/profile"
              className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Profile"
            >
              <Avatar url={profile?.avatar_url || null} size={8} username={profile?.username} />
              {profile?.username && (
                <span className="hidden lg:inline text-sm font-medium text-gray-700 dark:text-gray-300 pr-2">
                  {profile.username}
                </span>
              )}
            </Link>

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
