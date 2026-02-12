import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null;
  sub_syfse: { name: string } | null;
};

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null;
  replies?: Comment[];
};

interface PostViewProps {
  postId: string;
  onBack: () => void;
}

export function PostView({ postId, onBack }: PostViewProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    loadPost();
    loadComments();
  }, [postId]);

  const loadPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:profiles!author_id(username, avatar_url),
          sub_syfse:sub_syfses!sub_id(name)
        `)
        .eq('id', postId)
        .maybeSingle();

      if (error) throw error;
      setPost(data);
    } catch (err) {
      console.error('Error loading post:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:profiles!author_id(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      (data || []).forEach((comment) => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      commentMap.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies!.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      setComments(rootComments);
    } catch (err) {
      console.error('Error loading comments:', err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!profile || !commentText.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: profile.id,
          content: commentText,
          parent_id: parentId,
        });

      if (error) throw error;

      setCommentText('');
      setReplyingTo(null);
      loadComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
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

  const renderComment = (comment: Comment, depth = 0) => (
    <div key={comment.id} className={depth > 0 ? 'ml-6 mt-3' : 'mt-4'}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Avatar url={comment.author?.avatar_url || null} size={6} username={comment.author?.username} />
          <span className="font-medium">u/{comment.author?.username || 'deleted'}</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(comment.created_at)}</span>
          </div>
        </div>
        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
        {profile && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="mt-2 text-xs text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium"
          >
            Reply
          </button>
        )}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none text-sm"
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null);
                  setCommentText('');
                }}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {comment.replies && comment.replies.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-green-600 dark:text-green-500 hover:text-green-700 dark:hover:text-green-400 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-medium text-green-600 dark:text-green-500">
            s/{post.sub_syfse?.name}
          </span>
          <span>•</span>
          <div className="flex items-center gap-1">
             <Avatar url={post.author?.avatar_url || null} size={6} username={post.author?.username} />
             <span>u/{post.author?.username || 'deleted'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

        {post.image_url && (
          <div className="mb-4">
            <PostImage url={post.image_url} alt={post.title} className="w-full h-auto max-h-[600px] object-contain rounded-md bg-gray-100 dark:bg-gray-900" />
          </div>
        )}

        {post.content && (
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
            {post.content}
          </p>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
          <MessageSquare className="w-4 h-4" />
          <span>{comments.length} comments</span>
        </div>
      </div>

      {profile && (
        <div className="mt-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4">
          <form onSubmit={(e) => handleSubmitComment(e)}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Posting...' : 'Comment'}
            </button>
          </form>
        </div>
      )}

      <div className="mt-6">
        {comments.map((comment) => renderComment(comment))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
