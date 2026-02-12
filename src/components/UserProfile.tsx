import { useEffect, useState } from 'react';
import { Calendar, MessageSquare, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  sub_syfse: { name: string } | null;
  comment_count?: number;
};

type Comment = Database['public']['Tables']['comments']['Row'] & {
  post: { title: string } | null;
};

export function UserProfile() {
  const { profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [uploading, setUploading] = useState(false);

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

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile!.id}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('syfse-media')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', profile!.id);

      if (updateError) {
        throw updateError;
      }

      await refreshProfile();
    } catch (error) {
      alert('Error uploading avatar!');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatedContent distance={30} duration={0.5}>
        <SpotlightCard
          className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl mb-6"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="flex items-start gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl overflow-hidden">
                <Avatar url={profile.avatar_url} size={20} username={profile.username} />
              </div>
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2 text-gray-900">u/{profile.username}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.created_at)}</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>

      <AnimatedContent distance={40} duration={0.6} delay={0.1}>
        <SpotlightCard
          className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl !p-0 overflow-hidden"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="border-b border-gray-200 flex">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-all ${
                activeTab === 'posts'
                  ? 'text-green-600 bg-green-50 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`flex-1 px-4 py-4 text-sm font-medium transition-all ${
                activeTab === 'comments'
                  ? 'text-green-600 bg-green-50 border-b-2 border-green-500'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Comments
            </button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="text-center py-8 text-gray-500 flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </div>
            ) : activeTab === 'posts' ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="text-green-600 font-medium">s/{post.sub_syfse?.name}</span> • {formatTimeAgo(post.created_at)}
                    </div>
                    <h3 className="font-semibold mb-2 text-gray-900">{post.title}</h3>
                    {post.image_url && (
                      <div className="mb-2 rounded-xl overflow-hidden">
                        <PostImage url={post.image_url} alt={post.title} className="w-full h-48 object-cover bg-gray-100" />
                      </div>
                    )}
                    {post.content && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full w-fit">
                      <MessageSquare className="w-3 h-3" />
                      <span>{post.comment_count} comments</span>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No posts yet
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="border border-gray-200 rounded-xl p-4 hover:border-green-200 hover:shadow-sm transition-all"
                  >
                    <div className="text-xs text-gray-500 mb-2">
                      on "<span className="font-medium text-gray-700">{comment.post?.title}</span>" • {formatTimeAgo(comment.created_at)}
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-gray-700">{comment.content}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No comments yet
                  </div>
                )}
              </div>
            )}
          </div>
        </SpotlightCard>
      </AnimatedContent>
    </div>
  );
}
