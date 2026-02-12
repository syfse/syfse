import { useEffect, useState, useCallback } from 'react';
import { Calendar, MessageSquare, Camera } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import { Vote } from './Vote';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  sub_syfse: { name: string } | null;
  comment_count?: number;
  vote_count?: number;
};

type Comment = Database['public']['Tables']['comments']['Row'] & {
  post: { title: string } | null;
};

export function UserProfile() {
  const { profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [upvotedPosts, setUpvotedPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'upvoted'>('posts');
  const [uploading, setUploading] = useState(false);

  const loadUserContent = useCallback(async () => {
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
        (postsData as any[] || []).map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          const { data: voteData } = await supabase
            .from('users_votes')
            .select('is_upvote')
            .eq('post_id', post.id);

          const upvotes = (voteData as any[])?.filter((v: any) => v.is_upvote).length || 0;
          const downvotes = (voteData as any[])?.filter((v: any) => !v.is_upvote).length || 0;

          return {
            ...post,
            comment_count: count || 0,
            vote_count: upvotes - downvotes,
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

      // Load Upvoted Posts
      const { data: upvotesData, error: upvotesError } = await supabase
        .from('users_votes')
        .select(`
          post_id
        `)
        .eq('user_id', profile.id)
        .eq('is_upvote', true);

      if (upvotesError) throw upvotesError;

      const upvotedPostIds = (upvotesData as any[] || []).map(v => v.post_id);
      if (upvotedPostIds.length > 0) {
        const { data: likedPosts, error: likedError } = await supabase
          .from('posts')
          .select(`
            *,
            sub_syfse:sub_syfses!sub_id(name)
          `)
          .in('id', upvotedPostIds)
          .order('created_at', { ascending: false });

        if (likedError) throw likedError;

        const likedWithCounts = await Promise.all(
          (likedPosts as any[] || []).map(async (post) => {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact', head: true })
              .eq('post_id', post.id);

            const { data: voteData } = await supabase
              .from('users_votes')
              .select('is_upvote')
              .eq('post_id', post.id);

            const upvotes = (voteData as any[])?.filter((v: any) => v.is_upvote).length || 0;
            const downvotes = (voteData as any[])?.filter((v: any) => !v.is_upvote).length || 0;

            return {
              ...post,
              comment_count: count || 0,
              vote_count: upvotes - downvotes,
            };
          })
        );
        setUpvotedPosts(likedWithCounts);
      } else {
        setUpvotedPosts([]);
      }
    } catch (err) {
      console.error('Error loading user content:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      loadUserContent();
    }
  }, [profile, loadUserContent]);

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

  const renderPost = (post: Post) => (
    <div
      key={post.id}
      className="border border-gray-200 dark:border-gray-800 p-4"
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <Vote postId={post.id} initialVoteCount={post.vote_count || 0} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            s/{post.sub_syfse?.name} • {formatTimeAgo(post.created_at)}
          </div>
          <h3 className="font-semibold mb-2">{post.title}</h3>
          {post.image_url && (
            <div className="mb-2">
              <PostImage url={post.image_url} alt={post.title} className="w-full h-48 object-cover rounded-md bg-gray-100 dark:bg-gray-800" />
            </div>
          )}
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
      </div>
    </div>
  );

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

      const { error: updateError } = await (supabase
        .from('profiles') as any)
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
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative group">
            <Avatar url={profile.avatar_url} size={20} username={profile.username} />
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
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
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
          <button
            onClick={() => setActiveTab('upvoted')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'upvoted'
                ? 'text-green-600 dark:text-green-500 border-b-2 border-green-600 dark:border-green-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Upvoted
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading...
            </div>
          ) : activeTab === 'posts' ? (
            <div className="space-y-3">
              {posts.map((post) => renderPost(post))}
              {posts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No posts yet
                </div>
              )}
            </div>
          ) : activeTab === 'upvoted' ? (
            <div className="space-y-3">
              {upvotedPosts.map((post) => renderPost(post))}
              {upvotedPosts.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No upvoted posts yet
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
