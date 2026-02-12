import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import { Card, Loading, EmptyState } from './ui';
import { formatTimeAgo } from '../lib/utils';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null;
  sub_syfse: { name: string } | null;
  comment_count?: number;
};

interface PostsFeedProps {
  communityId?: string;
}

export function PostsFeed({ communityId }: PostsFeedProps) {
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
          author:profiles!author_id(username, avatar_url),
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

  if (loading) {
    return <Loading message="Loading posts..." />;
  }

  if (posts.length === 0) {
    return (
      <Card className="p-6">
        <EmptyState
          message={
            communityId
              ? 'No posts in this community yet. Be the first to post!'
              : 'No posts yet. Create or join a community to get started!'
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <Link key={post.id} to={`/post/${post.id}`}>
          <Card interactive className="p-5 text-left block">
            <div className="flex items-start gap-4">
              <div className="flex-col items-center gap-1 hidden sm:flex">
                <Avatar url={post.author?.avatar_url || null} size={10} username={post.author?.username} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Link 
                    to={`/s/${post.sub_syfse?.name}`} 
                    className="font-medium text-green-600 dark:text-green-500 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    s/{post.sub_syfse?.name}
                  </Link>
                  <span>•</span>
                  <Link 
                    to={`/u/${post.author?.username}`}
                    className="flex items-center gap-1 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    u/{post.author?.username || 'deleted'}
                  </Link>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(post.created_at)}</span>
                  </div>
                </div>

                <h2 className="font-semibold text-lg mb-2 line-clamp-2">
                  {post.title}
                </h2>

                {(post.assets?.[0] || post.image_url) && (
                  <div className="mb-3">
                    <PostImage url={post.assets?.[0] || post.image_url!} alt={post.title} className="w-full h-auto max-h-96 object-cover" />
                  </div>
                )}

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
          </Card>
        </Link>
      ))}
    </div>
  );
}
