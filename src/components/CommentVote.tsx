import { useState, useEffect, useCallback } from 'react'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface CommentVoteProps {
    commentId: string
    initialVoteCount: number
    horizontal?: boolean
}

export function CommentVote({
    commentId,
    initialVoteCount,
    horizontal = false,
}: CommentVoteProps) {
    const { user } = useAuth()
    const [voteCount, setVoteCount] = useState(initialVoteCount)
    const [userVote, setUserVote] = useState<boolean | null>(null)

    useEffect(() => {
        setVoteCount(initialVoteCount)
    }, [initialVoteCount])

    const fetchUserVote = useCallback(async () => {
        try {
            if (!user) return
            const { data, error } = await supabase
                .from('comment_votes')
                .select('is_upvote')
                .eq('comment_id', commentId)
                .eq('user_id', user.id)
                .maybeSingle()

            if (error) throw error
            if (data) {
                setUserVote((data as { is_upvote: boolean }).is_upvote)
            } else {
                setUserVote(null)
            }
        } catch (err) {
            console.error('Error fetching comment vote:', err)
        }
    }, [user, commentId])

    useEffect(() => {
        if (user) {
            fetchUserVote()
        } else {
            setUserVote(null)
        }
    }, [user, commentId, fetchUserVote])

    const handleVote = async (isUpvote: boolean) => {
        if (!user) {
            alert('You must be logged in to vote')
            return
        }

        const originalVote = userVote
        const originalCount = voteCount

        let nextVote: boolean | null
        let nextCount = voteCount

        if (userVote === isUpvote) {
            nextVote = null
            nextCount = isUpvote ? voteCount - 1 : voteCount + 1
        } else {
            nextVote = isUpvote
            if (userVote === null) {
                nextCount = isUpvote ? voteCount + 1 : voteCount - 1
            } else {
                nextCount = isUpvote ? voteCount + 2 : voteCount - 2
            }
        }

        setUserVote(nextVote)
        setVoteCount(nextCount)

        try {
            if (nextVote === null) {
                const { error } = await supabase
                    .from('comment_votes')
                    .delete()
                    .eq('comment_id', commentId)
                    .eq('user_id', user.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('comment_votes')
                    .upsert(
                        {
                            comment_id: commentId,
                            user_id: user.id,
                            is_upvote: nextVote,
                        },
                        {
                            onConflict: 'user_id,comment_id',
                        }
                    )
                if (error) throw error
            }
        } catch (err) {
            console.error('Error voting on comment:', err)
            setUserVote(originalVote)
            setVoteCount(originalCount)
        }
    }

    return (
        <div
            className={`flex ${
                horizontal
                    ? 'flex-row items-center gap-2'
                    : 'flex-col items-center gap-0.5'
            }`}
            onClick={e => e.stopPropagation()}
        >
            <button
                onClick={() => handleVote(true)}
                className={`rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    userVote === true ? 'text-orange-600' : 'text-gray-500'
                }`}
                aria-label="Upvote comment"
            >
                <ArrowBigUp
                    className={`h-5 w-5 ${userVote === true ? 'fill-current' : ''}`}
                />
            </button>

            <span
                className={`min-w-[1rem] text-center text-xs font-bold ${
                    userVote === true
                        ? 'text-orange-600'
                        : userVote === false
                          ? 'text-blue-600'
                          : 'text-gray-900 dark:text-gray-100'
                }`}
            >
                {voteCount}
            </span>

            <button
                onClick={() => handleVote(false)}
                className={`rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                    userVote === false ? 'text-blue-600' : 'text-gray-500'
                }`}
                aria-label="Downvote comment"
            >
                <ArrowBigDown
                    className={`h-5 w-5 ${userVote === false ? 'fill-current' : ''}`}
                />
            </button>
        </div>
    )
}
