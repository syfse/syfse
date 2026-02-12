import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './Avatar';
import { PostImage } from './PostImage';
import { Button, Card, Textarea, Loading, BackButton } from './ui';
import { formatTimeAgo } from '../lib/utils';
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
    <div key={comment.id} className={depth > 0 ? 'ml-6 mt-3' : 'mt-4'}>
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
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
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              required
            />
            <div className="flex gap-2 mt-2">
              <Button type="submit" size="sm" disabled={submitting}>
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
    return <Loading message="Loading post..." />;
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Post not found</p>
        <BackButton to="/" className="mt-4 inline-flex" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton to="/" />

      <Card className="p-6">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Link to={`/s/${post.sub_syfse?.name}`} className="font-medium text-green-600 dark:text-green-500 hover:underline">
            s/{post.sub_syfse?.name}
          </Link>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Avatar url={post.author?.avatar_url || null} size={6} username={post.author?.username} />
            <Link to={`/u/${post.author?.username}`} className="hover:underline">
              u/{post.author?.username || 'deleted'}
            </Link>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatTimeAgo(post.created_at)}</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

        {(post.assets?.[0] || post.image_url) && (
          <div className="mb-4">
            <PostImage url={post.assets?.[0] || post.image_url!} alt={post.title} className="w-full h-auto max-h-[600px] object-contain bg-gray-100 dark:bg-gray-900" />
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
      </Card>

      {profile && !replyingTo && (
        <div className="mt-6">
          {!isCommenting ? (
            <button
              onClick={() => setIsCommenting(true)}
              className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Add a comment...
            </button>
          ) : (
            <Card className="p-4">
              <form onSubmit={(e) => handleSubmitComment(e)}>
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows={4}
                  required
                />
                <div className="flex gap-2 mt-3">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Comment'}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setIsCommenting(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}
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
