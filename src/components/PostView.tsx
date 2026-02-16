import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Clock, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './Avatar'
import { PostImage } from './PostImage'
import { BackButton, Textarea } from './ui'
import { formatTimeAgo } from '../lib/utils'
import { Vote } from './Vote'
import { CommentVote } from './CommentVote'
import SpotlightCard from './SpotlightCard'
import AnimatedContent from './AnimatedContent'
import Magnet from './Magnet'
import type { Database } from '../lib/database.types'

type Post = Database['public']['Tables']['posts']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null
  sub_syfse: { name: string } | null
  vote_count?: number
}

type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: { username: string | null; avatar_url: string | null } | null
  replies?: Comment[]
  vote_count?: number
}

export function PostView() {
  const navigate = useNavigate()
  const { id: postId } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [isCommenting, setIsCommenting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [voteCount, setVoteCount] = useState(0)
  const { profile } = useAuth()

  const loadPost = useCallback(async () => {
    if (!postId) return
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
      *,
      author:profiles!author_id(username, avatar_url),
      sub_syfse:sub_syfses!sub_id(name)
    `
        )
        .eq('id', postId)
        .maybeSingle()

      if (error) throw error
      setPost(data)

      if (data) {
        const { data: voteData } = await supabase
          .from('users_votes')
          .select('is_upvote')
          .eq('post_id', postId)

        const upvotes =
          voteData?.filter(v => v.is_upvote).length || 0
        const downvotes =
          voteData?.filter(v => !v.is_upvote).length || 0
        setVoteCount(upvotes - downvotes)
      }
    } catch (err) {
      console.error('Error loading post:', err)
    } finally {
      setLoading(false)
    }
  }, [postId])

  const loadComments = useCallback(async () => {
    if (!postId) return
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(
          `
      *,
      author:profiles!author_id(username, avatar_url)
    `
        )
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error

      const commentMap = new Map<string, Comment>()
      const rootComments: Comment[] = []

      ;(data || []).forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })

      if (data?.length) {
        const commentIds = data.map(comment => comment.id)
        const { data: voteData } = await supabase
          .from('comment_votes')
          .select('comment_id, is_upvote')
          .in('comment_id', commentIds)

        const voteMap = new Map<string, number>()
        voteData?.forEach(vote => {
          const current = voteMap.get(vote.comment_id) || 0
          voteMap.set(
            vote.comment_id,
            current + (vote.is_upvote ? 1 : -1)
          )
        })

        commentMap.forEach(comment => {
          const count = voteMap.get(comment.id)
          if (typeof count === 'number') {
            comment.vote_count = count
          }
        })
      }

      commentMap.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies!.push(comment)
          }
        } else {
          rootComments.push(comment)
        }
      })

      setComments(rootComments)
    } catch (err) {
      console.error('Error loading comments:', err)
    }
  }, [postId])

  useEffect(() => {
    if (postId) {
      loadPost()
      loadComments()
    }
  }, [postId, loadPost, loadComments])

  const handleSubmitComment = async (
    e: React.FormEvent,
    parentId: string | null = null
  ) => {
    e.preventDefault()
    const text = parentId ? replyText : commentText
    if (!profile || !text.trim() || !postId) return

    setSubmitting(true)
    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        author_id: profile.id,
        content: text,
        parent_id: parentId,
      })

      if (error) throw error

      if (parentId) {
        setReplyText('')
        setReplyingTo(null)
      } else {
        setCommentText('')
        setIsCommenting(false)
      }
      loadComments()
    } catch (err) {
      console.error('Error submitting comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const renderComment = (comment: Comment, depth = 0) => (
    <div
      key={comment.id}
      className={`space-y-3 ${depth > 0 ? 'ml-6' : ''}`}
    >
      <div className="rounded-xl border border-gray-200 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-green-200">
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
          <CommentVote
            commentId={comment.id}
            initialVoteCount={comment.vote_count || 0}
            horizontal
          />
          <Avatar
            url={comment.author?.avatar_url || null}
            size={6}
            username={comment.author?.username}
          />
          <Link
            to={`/u/${comment.author?.username}`}
            className="font-medium hover:underline"
          >
            u/{comment.author?.username || 'deleted'}
          </Link>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(comment.created_at)}</span>
          </div>
        </div>
        <p className="whitespace-pre-wrap text-sm text-gray-700">
          {comment.content}
        </p>
        {profile && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            className="mt-2 text-xs font-medium text-green-600 hover:text-green-700"
          >
            Reply
          </button>
        )}
        {replyingTo === comment.id && (
          <form
            onSubmit={e => handleSubmitComment(e, comment.id)}
            className="mt-3"
          >
            <Textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
            <div className="mt-2 flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-medium text-white shadow-md shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Reply'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyingTo(null)
                  setReplyText('')
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
      {comment.replies &&
        comment.replies.map(reply => renderComment(reply, depth + 1))}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-500">
          <svg
            className="h-5 w-5 animate-spin text-green-500"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading post...
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500">Post not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 font-medium text-green-600 hover:text-green-700"
        >
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <AnimatedContent distance={30} duration={0.5}>
        <BackButton onClick={() => navigate(-1)} className="mb-6" />
      </AnimatedContent>

      <AnimatedContent distance={40} duration={0.6} delay={0.1}>
        <SpotlightCard
          className="!rounded-2xl !border-gray-200 !bg-white/90 backdrop-blur-sm"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <Vote postId={post.id} initialVoteCount={voteCount} />
            <span className="rounded-full bg-green-50 px-2 py-0.5 font-semibold text-green-600">
              s/{post.sub_syfse?.name}
            </span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Avatar
                url={post.author?.avatar_url || null}
                size={6}
                username={post.author?.username}
              />
              <span>u/{post.author?.username || 'deleted'}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTimeAgo(post.created_at)}</span>
            </div>
          </div>

          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            {post.title}
          </h1>

          {(post.assets?.[0] || post.image_url) && (
            <div className="mb-4 overflow-hidden rounded-xl">
              <PostImage
                url={post.assets?.[0] || post.image_url!}
                alt={post.title}
                className="h-auto max-h-[600px] w-full bg-gray-100 object-contain"
              />
            </div>
          )}

          {post.content && (
            <p className="mb-4 whitespace-pre-wrap text-gray-700">
              {post.content}
            </p>
          )}

          <div className="flex items-center gap-2 border-t border-gray-200 pt-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1">
              <MessageSquare className="h-4 w-4" />
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
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-4 text-left text-gray-500 backdrop-blur-sm transition-all hover:border-green-200 hover:bg-white"
            >
              Add a comment...
            </button>
          ) : (
            <SpotlightCard
              className="!rounded-2xl !border-gray-200 !bg-white/90 backdrop-blur-sm"
              spotlightColor="rgba(34, 197, 94, 0.1)"
            >
              <form onSubmit={e => handleSubmitComment(e)}>
                <Textarea
                  value={commentText}
                  onChange={e =>
                    setCommentText(e.target.value)
                  }
                  placeholder="What are your thoughts?"
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <div className="mt-3 flex gap-3">
                  <Magnet
                    padding={20}
                    magnetStrength={4}
                    disabled={submitting}
                  >
                    <button
                      type="submit"
                      disabled={submitting}
                      className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                    >
                      {submitting
                        ? 'Posting...'
                        : 'Comment'}
                    </button>
                  </Magnet>
                  <button
                    type="button"
                    onClick={() => setIsCommenting(false)}
                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </SpotlightCard>
          )}
        </div>
      )}

      <div className="mt-6">
        {comments.map(comment => renderComment(comment))}
        {comments.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white/80 py-8 text-center text-gray-500 backdrop-blur-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </div>
    </div>
  )
}
