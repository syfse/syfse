import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react';
import DotGrid from './DotGrid';
import AnimatedContent from './AnimatedContent';
import ShinyText from './ShinyText';
import Magnet from './Magnet';
import SpotlightCard from './SpotlightCard';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('Username is required');
        }
        if (username.length < 3) {
          throw new Error('Username must be at least 3 characters long');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }
        await signUp(email, password, username);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden px-4">
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

      <div className="max-w-md w-full relative z-10">
        <AnimatedContent distance={60} duration={0.8}>
          <SpotlightCard 
            className="!bg-white/90 backdrop-blur-xl !border-gray-200 !rounded-2xl shadow-2xl shadow-gray-200/50"
            spotlightColor="rgba(34, 197, 94, 0.15)"
          >
            <div className="flex flex-col items-center mb-8">
              <Magnet padding={60} magnetStrength={2}>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
                  {isLogin ? (
                    <LogIn className="w-8 h-8 text-white" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-white" />
                  )}
                </div>
              </Magnet>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Syfse Club</h1>
              <ShinyText 
                text="Connect with your community"
                className="text-sm mt-2"
                color="#9ca3af"
                shineColor="#22c55e"
                speed={3}
              />
            </div>

            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
              {isLogin ? 'Welcome Back' : 'Join the Club'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-2 text-gray-700">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Choose a username"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              <Magnet padding={20} magnetStrength={5} disabled={loading} className="w-full">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </Magnet>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-600 hover:text-green-600 font-medium transition-colors"
              >
                {isLogin ? (
                  <>Don't have an account? <span className="text-green-600">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="text-green-600">Sign in</span></>
                )}
              </button>
            </div>
          </SpotlightCard>
        </AnimatedContent>
      </div>
    </div>
  );
}
