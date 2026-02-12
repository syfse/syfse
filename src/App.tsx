import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { CommunitiesList } from './components/CommunitiesList';
import { CommunityView } from './components/CommunityView';
import { PostsFeed } from './components/PostsFeed';
import { PostView } from './components/PostView';
import { CreatePost } from './components/CreatePost';
import { UserProfile } from './components/UserProfile';

type View =
  | { type: 'home' }
  | { type: 'communities' }
  | { type: 'community'; id: string }
  | { type: 'post'; id: string }
  | { type: 'create-post' }
  | { type: 'profile' };

function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState<View>({ type: 'home' });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleNavigate = (target: string) => {
    switch (target) {
      case 'home':
        setView({ type: 'home' });
        break;
      case 'communities':
        setView({ type: 'communities' });
        break;
      case 'create-post':
        setView({ type: 'create-post' });
        break;
      case 'profile':
        setView({ type: 'profile' });
        break;
    }
  };

  const getCurrentViewName = () => {
    switch (view.type) {
      case 'home':
        return 'home';
      case 'communities':
      case 'community':
        return 'communities';
      case 'create-post':
        return 'create-post';
      case 'profile':
        return 'profile';
      default:
        return 'home';
    }
  };

  return (
    <Layout currentView={getCurrentViewName()} onNavigate={handleNavigate}>
      {view.type === 'home' && (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 tracking-tight">Home</h1>
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

      {view.type === 'post' && (
        <PostView postId={view.id} onBack={() => setView({ type: 'home' })} />
      )}

      {view.type === 'create-post' && (
        <CreatePost
          onBack={() => setView({ type: 'home' })}
          onSuccess={() => setView({ type: 'home' })}
        />
      )}

      {view.type === 'profile' && <UserProfile />}
    </Layout>
  );
}

export default App;
