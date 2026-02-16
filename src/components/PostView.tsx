import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import { Button, Card, Textarea, Loading, BackButton } from './ui';
import { formatTimeAgo } from '../lib/utils';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
import Magnet from './Magnet';
import type { Database } from '../lib/database.types';

type Post = Database['public']['Tables']['posts']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null;
  sub_syfse: { name: string } | null;
};

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null;
  replies?: Comment[];
};

export function PostView() {
  const { id: postId } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
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
    const text = parentId ? replyText : commentText;
    if (!profile || !text.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: profile.id,
          content: text,
          parent_id: parentId,
        });

      if (error) throw error;

      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setCommentText('');
        setIsCommenting(false);
      }
      loadComments();
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (comment: Comment, depth = 0) => (
      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 hover:border-green-200 transition-all">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Avatar url={comment.author?.avatar_url || null} size={6} username={comment.author?.username} />
          <Link to={`/u/${comment.author?.username}`} className="font-medium hover:underline">
            u/{comment.author?.username || 'deleted'}
          </Link>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(comment.created_at)}</span>
          </div>
        </div>
        <p className="text-sm whitespace-pre-wrap text-gray-700">{comment.content}</p>
        {profile && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="mt-2 text-xs text-green-600 hover:text-green-700 font-medium"
          >
            Reply
          </button>
        )}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-3">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm transition-all"
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium disabled:opacity-50 transition-all rounded-lg shadow-md shadow-green-500/20"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyText('');
                }}
                className="px-4 py-2 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all rounded-lg text-gray-700"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
      {comment.replies && comment.replies.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading post...
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-green-600 hover:text-green-700 font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatedContent distance={30} duration={0.5}>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </AnimatedContent>

      <AnimatedContent distance={40} duration={0.6} delay={0.1}>
        <SpotlightCard
          className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
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

          <h1 className="text-2xl font-bold mb-4 text-gray-900">{post.title}</h1>

          {(post.assets?.[0] || post.image_url) && (
            <div className="mb-4 rounded-xl overflow-hidden">
              <PostImage url={post.assets?.[0] || post.image_url!} alt={post.title} className="w-full h-auto max-h-[600px] object-contain bg-gray-100" />
            </div>
          )}

          {post.content && (
            <p className="text-gray-700 whitespace-pre-wrap mb-4">
              {post.content}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length} comments</span>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>
      {profile && !replyingTo && (
        <div className="mt-6">
          {!isCommenting ? (
            <button
              onClick={() => setIsCommenting(true)}
              className="w-full text-left px-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-white hover:border-green-200 rounded-xl transition-all"
            >
              Add a comment...
            </button>
          ) : (
            <SpotlightCard
              className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl"
              spotlightColor="rgba(34, 197, 94, 0.1)"
            >
              <form onSubmit={(e) => handleSubmitComment(e)}>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                  required
                />
                <div className="flex gap-3 mt-3">
                  <Magnet padding={20} magnetStrength={4} disabled={submitting}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium disabled:opacity-50 transition-all rounded-xl shadow-lg shadow-green-500/20"
                    >
                      {submitting ? 'Posting...' : 'Comment'}
                    </button>
                  </Magnet>
                  <button
                    type="button"
                    onClick={() => setIsCommenting(false)}
                    className="px-5 py-2.5 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all rounded-xl text-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </SpotlightCard>
          )}
        </div>
      )}

      <div className="mt-6">
        {comments.map((comment) => renderComment(comment))}
        {comments.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  );
}
