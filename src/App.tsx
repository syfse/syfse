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
import ShinyText from './components/ShinyText';
import AnimatedContent from './components/AnimatedContent';

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <ShinyText 
            text="Loading..."
            color="#9ca3af"
            shineColor="#22c55e"
            speed={2}
          />
        </div>
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
