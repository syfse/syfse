import { useEffect, useState } from 'react';
import { User, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  sub_syfse: { name: string } | null;
  comment_count?: number;
};

type Comment = Database['public']['Tables']['comments']['Row'] & {
  post: { title: string } | null;
};

export function UserProfile() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');

  useEffect(() => {
    if (profile) {
      loadUserContent();
    }
  }, [profile]);

  const loadUserContent = async () => {
    if (!profile) return;

    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          sub_syfse:sub_syfses!sub_id(name)
        `)
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (postsError) throw postsError;

      const postsWithCounts = await Promise.all(
        (postsData || []).map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          return {
            ...post,
            comment_count: count || 0,
          };
        })
      );

      setPosts(postsWithCounts);

      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          post:posts!post_id(title)
        `)
        .eq('author_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (err) {
      console.error('Error loading user content:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-green-600 flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">u/{profile.username}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(profile.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800 flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Comments
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : activeTab === 'posts' ? (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    s/{post.sub_syfse?.name} • {formatTimeAgo(post.created_at)}
                  </div>
                  <h3 className="font-semibold mb-2">{post.title}</h3>
                  {post.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {post.content}
                    </p>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <MessageSquare className="w-3 h-3" />
                    <span>{post.comment_count} comments</span>
                  </div>
                </div>
              ))}
              {posts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No posts yet
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    on "{comment.post?.title}" • {formatTimeAgo(comment.created_at)}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No comments yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
