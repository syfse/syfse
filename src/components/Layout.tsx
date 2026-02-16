import { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Plus, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './Avatar'
import DotGrid from './DotGrid'
import Magnet from './Magnet'

interface LayoutProps {
    children: ReactNode
}

export function Layout({ children }: LayoutProps) {
    const { profile, signOut } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const isHome = location.pathname === '/'
    const isCommunities = location.pathname.startsWith('/s')

    return (
        <div className="relative min-h-screen bg-white">
            {/* DotGrid Background */}
            <div className="pointer-events-none fixed inset-0 z-0">
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
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <div className="flex items-center gap-8">
                        <Magnet padding={50} magnetStrength={3}>
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-3 transition-opacity hover:opacity-80"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20">
                                    <span className="text-lg font-bold text-white">
                                        S
                                    </span>
                                </div>
                                <span className="text-xl font-bold tracking-tight text-gray-900">
                                    Syfse Club
                                </span>
                            </button>
                        </Magnet>

                        <nav className="hidden items-center gap-1 md:flex">
                            <Magnet padding={30} magnetStrength={4}>
                                <button
                                    onClick={() => navigate('/')}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        isHome
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Home className="h-5 w-5" />
                                </button>
                            </Magnet>
                            <Magnet padding={30} magnetStrength={4}>
                                <button
                                    onClick={() => navigate('/s')}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                        isCommunities
                                            ? 'bg-green-100 text-green-700'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                >
                                    <Users className="h-5 w-5" />
                                </button>
                            </Magnet>
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Magnet padding={40} magnetStrength={3}>
                            <button
                                onClick={() => navigate('/create')}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 hover:shadow-green-500/30"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Create</span>
                            </button>
                        </Magnet>

                        <div className="h-8 w-px bg-gray-200" />

                        <Magnet padding={30} magnetStrength={4}>
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 rounded-full p-1.5 transition-all hover:bg-gray-100"
                                aria-label="Profile"
                            >
                                <Avatar
                                    url={profile?.avatar_url || null}
                                    size={9}
                                    username={profile?.username}
                                />
                                {profile?.username && (
                                    <span className="hidden pr-1 text-sm font-medium text-gray-700 lg:inline">
                                        {profile.username}
                                    </span>
                                )}
                            </button>
                        </Magnet>

                        <Magnet padding={30} magnetStrength={4}>
                            <button
                                onClick={signOut}
                                className="rounded-lg p-2.5 transition-all hover:bg-red-50 hover:text-red-600"
                                aria-label="Sign out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </Magnet>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
                {children}
            </main>
        </div>
    )
}
