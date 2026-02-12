import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { CommunitiesList } from './components/CommunitiesList';
import { CommunityView } from './components/CommunityView';
import { PostsFeed } from './components/PostsFeed';
import { PostView } from './components/PostView';
import { CreatePost } from './components/CreatePost';
import { UserProfile, PublicUserProfile } from './components/UserProfile';
import { Loading } from './components/ui';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loading message="Loading..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 tracking-tight">Home</h1>
      <PostsFeed />
    </div>
  );
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loading message="Loading..." />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
      
      <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
      
      <Route path="/s" element={<ProtectedRoute><CommunitiesList /></ProtectedRoute>} />
      <Route path="/s/:name" element={<ProtectedRoute><CommunityView /></ProtectedRoute>} />
      
      <Route path="/post/:id" element={<ProtectedRoute><PostView /></ProtectedRoute>} />
      
      <Route path="/create" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/u/:username" element={<ProtectedRoute><PublicUserProfile /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
