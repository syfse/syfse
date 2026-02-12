import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';
import { Button, Input, Card, Alert } from './ui';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="max-w-md w-full">
        <Card className="p-8 shadow-sm">
          <div className="flex items-center justify-center mb-8">
            <div className="w-12 h-12 bg-green-600 flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="ml-3 text-2xl font-bold tracking-tight">Syfse Club</h1>
          </div>

          <h2 className="text-xl font-semibold mb-6 text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          {error && <Alert className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
