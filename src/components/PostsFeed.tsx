import { useEffect, useState } from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  author: { username: string | null } | null;
  sub_syfse: { name: string } | null;
  comment_count?: number;
};

interface PostsFeedProps {
  communityId?: string;
  onSelectPost: (id: string) => void;
}

export function PostsFeed({ communityId, onSelectPost }: PostsFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, [communityId]);

  const loadPosts = async () => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(username),
          sub_syfse:sub_syfses!sub_id(name)
        `)
        .order('created_at', { ascending: false });

      if (communityId) {
        query = query.eq('sub_id', communityId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const postsWithCounts = await Promise.all(
        (data || []).map(async (post) => {
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
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => onSelectPost(post.id)}
          className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors text-left"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="font-medium text-green-600 dark:text-green-500">
                  s/{post.sub_syfse?.name}
                </span>
                <span>•</span>
                <span>u/{post.author?.username || 'deleted'}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(post.created_at)}</span>
                </div>
              </div>

              <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                {post.title}
              </h2>

              {post.content && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
                  {post.content}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comment_count} comments</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          {communityId
            ? 'No posts in this community yet. Be the first to post!'
            : 'No posts yet. Create or join a community to get started!'}
        </div>
      )}
    </div>
  );
}
