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
import ShinyText from './components/ShinyText';
import AnimatedContent from './components/AnimatedContent';

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
    <Layout currentView={getCurrentViewName()} onNavigate={handleNavigate}>
      {view.type === 'home' && (
        <div className="max-w-4xl mx-auto">
          <AnimatedContent distance={30} duration={0.5}>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Home</h1>
              <p className="text-gray-500">Discover the latest from your communities</p>
            </div>
          </AnimatedContent>
          <PostsFeed onSelectPost={(id) => setView({ type: 'post', id })} />
        </div>
      )}

      {view.type === 'communities' && (
        <CommunitiesList onSelectCommunity={(id) => setView({ type: 'community', id })} />
      )}

      {view.type === 'community' && (
        <CommunityView
          communityId={view.id}
          onBack={() => setView({ type: 'communities' })}
          onSelectPost={(id) => setView({ type: 'post', id })}
        />
      )}

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
