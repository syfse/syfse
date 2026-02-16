import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import { Card, Loading, EmptyState } from './ui';
import { formatTimeAgo } from '../lib/utils';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
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
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading posts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <AnimatedContent key={post.id} distance={40} duration={0.6} delay={index * 0.1}>
          <SpotlightCard
            className="!bg-white/80 backdrop-blur-sm !border-gray-200 !rounded-2xl !p-0 cursor-pointer hover:!border-green-300 transition-all hover:shadow-lg hover:shadow-green-500/10"
            spotlightColor="rgba(34, 197, 94, 0.1)"
          >
            <button
              onClick={() => onSelectPost(post.id)}
              className="w-full p-5 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="flex-col items-center gap-1 hidden sm:flex">
                  <Avatar url={post.author?.avatar_url || null} size={10} username={post.author?.username} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      s/{post.sub_syfse?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                       u/{post.author?.username || 'deleted'}
                    </span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post.created_at)}</span>
                    </div>
                  </div>

                  <h2 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900">
                    {post.title}
                  </h2>

                  {(post.assets?.[0] || post.image_url) && (
                    <div className="mb-3 rounded-xl overflow-hidden">
                      <PostImage url={post.assets?.[0] || post.image_url!} alt={post.title} className="w-full h-auto max-h-96 object-cover" />
                    </div>
                  )}

                  {post.content && (
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                      {post.content}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </SpotlightCard>
        </AnimatedContent>
      ))}

      {posts.length === 0 && (
        <SpotlightCard
          className="!bg-white/80 backdrop-blur-sm !border-gray-200 !rounded-2xl"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="text-center py-12 text-gray-500">
            {communityId
              ? 'No posts in this community yet. Be the first to post!'
              : 'No posts yet. Create or join a community to get started!'}
          </div>
        </SpotlightCard>
      )}
    </div>
  );
}
