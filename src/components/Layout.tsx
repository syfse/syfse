import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { Button } from './ui';
import DotGrid from './DotGrid';
import Magnet from './Magnet';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white relative">
      {/* DotGrid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid
          dotSize={4}
          gap={24}
          baseColor="#e5e7eb"
          activeColor="#22c55e"
          proximity={120}
          shockRadius={200}
          shockStrength={3}
        />
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Magnet padding={50} magnetStrength={3}>
              <button
                onClick={() => onNavigate('home')}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900">Syfse Club</span>
              </button>
            </Magnet>

            <nav className="hidden md:flex items-center gap-1">
              <Magnet padding={30} magnetStrength={4}>
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'home'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </button>
              </Magnet>
              <Magnet padding={30} magnetStrength={4}>
                <button
                  onClick={() => onNavigate('communities')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentView === 'communities'
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Users className="w-5 h-5" />
                </button>
              </Magnet>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Magnet padding={40} magnetStrength={3}>
              <button
                onClick={() => onNavigate('create-post')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium flex items-center gap-2 transition-all rounded-lg shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </button>
            </Magnet>

            <div className="h-8 w-px bg-gray-200" />

            <Magnet padding={30} magnetStrength={4}>
              <button
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 transition-all rounded-full"
                aria-label="Profile"
              >
                <Avatar url={profile?.avatar_url || null} size={9} username={profile?.username} />
                {profile?.username && (
                  <span className="hidden lg:inline text-sm font-medium text-gray-700 pr-1">
                    {profile.username}
                  </span>
                )}
              </button>
            </Magnet>

            <Magnet padding={30} magnetStrength={4}>
              <button
                onClick={signOut}
                className="p-2.5 hover:bg-red-50 hover:text-red-600 transition-all rounded-lg"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Magnet>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
