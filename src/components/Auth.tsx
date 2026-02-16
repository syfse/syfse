import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LogIn, UserPlus } from 'lucide-react'
import DotGrid from './DotGrid'
import AnimatedContent from './AnimatedContent'
import ShinyText from './ShinyText'
import Magnet from './Magnet'
import SpotlightCard from './SpotlightCard'

export function Auth() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (isLogin) {
                await signIn(email, password)
            } else {
                if (!username.trim()) {
                    throw new Error('Username is required')
                }
                if (username.length < 3) {
                    throw new Error(
                        'Username must be at least 3 characters long'
                    )
                }
                if (password.length < 6) {
                    throw new Error(
                        'Password must be at least 6 characters long'
                    )
                }
                await signUp(email, password, username)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4">
            {/* DotGrid Background */}
            <div className="fixed inset-0 z-0">
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

            <div className="relative z-10 w-full max-w-md">
                <AnimatedContent distance={60} duration={0.8}>
                    <SpotlightCard
                        className="!rounded-2xl !border-gray-200 !bg-white/90 shadow-2xl shadow-gray-200/50 backdrop-blur-xl"
                        spotlightColor="rgba(34, 197, 94, 0.15)"
                    >
                        <div className="mb-8 flex flex-col items-center">
                            <Magnet padding={60} magnetStrength={2}>
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                                    {isLogin ? (
                                        <LogIn className="h-8 w-8 text-white" />
                                    ) : (
                                        <UserPlus className="h-8 w-8 text-white" />
                                    )}
                                </div>
                            </Magnet>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                Syfse Club
                            </h1>
                            <ShinyText
                                text="Connect with your community"
                                className="mt-2 text-sm"
                                color="#9ca3af"
                                shineColor="#22c55e"
                                speed={3}
                            />
                        </div>

                        <h2 className="mb-6 text-center text-xl font-semibold text-gray-800">
                            {isLogin ? 'Welcome Back' : 'Join the Club'}
                        </h2>

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Username
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={e =>
                                            setUsername(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Choose a username"
                                        required={!isLogin}
                                    />
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Magnet
                                padding={20}
                                magnetStrength={5}
                                disabled={loading}
                                className="w-full"
                            >
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 py-3 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-600 hover:to-green-700 hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg
                                                className="h-5 w-5 animate-spin"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : isLogin ? (
                                        'Sign In'
                                    ) : (
                                        'Create Account'
                                    )}
                                </button>
                            </Magnet>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
                            >
                                {isLogin ? (
                                    <>
                                        Don't have an account?{' '}
                                        <span className="text-green-600">
                                            Sign up
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <span className="text-green-600">
                                            Sign in
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </SpotlightCard>
                </AnimatedContent>
            </div>
        </div>
    )
}
