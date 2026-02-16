import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MessageSquare, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Avatar } from './Avatar'
import { PostImage } from './PostImage'
import { Card, Loading, EmptyState, BackButton } from './ui'
import { formatTimeAgo, formatDate } from '../lib/utils'
import type { Database } from '../lib/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

type Post = Database['public']['Tables']['posts']['Row'] & {
    sub_syfse: { name: string } | null
    comment_count?: number
}

type Comment = Database['public']['Tables']['comments']['Row'] & {
    post: { title: string; id: string } | null
}

interface ProfileContentProps {
    profile: Profile
    posts: Post[]
    comments: Comment[]
    loading: boolean
    activeTab: 'posts' | 'comments'
    setActiveTab: (tab: 'posts' | 'comments') => void
    isOwnProfile?: boolean
    onAvatarUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void
    uploading?: boolean
}

function ProfileContent({
    profile,
    posts,
    comments,
    loading,
    activeTab,
    setActiveTab,
    isOwnProfile = false,
    onAvatarUpload,
    uploading = false,
}: ProfileContentProps) {
    return (
        <div className="mx-auto max-w-4xl">
            <Card className="mb-6 p-6">
                <div className="flex items-start gap-4">
                    <div className="group relative">
                        <Avatar
                            url={profile.avatar_url}
                            size={20}
                            username={profile.username}
                        />
                        {isOwnProfile && onAvatarUpload && (
                            <>
                                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Camera className="h-6 w-6 text-white" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onAvatarUpload}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <div className="h-5 w-5 animate-spin border-2 border-white border-t-transparent" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex-1">
                        <h1 className="mb-1 text-2xl font-bold">
                            u/{profile.username}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {formatDate(profile.created_at)}</span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'posts'
                                ? 'border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                        }`}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => setActiveTab('comments')}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                            activeTab === 'comments'
                                ? 'border-b-2 border-green-600 text-green-600 dark:border-green-500 dark:text-green-500'
                                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
                        }`}
                    >
                        Comments
                    </button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <Loading />
                    ) : activeTab === 'posts' ? (
                        <div className="space-y-3">
                            {posts.map(post => (
                                <Link key={post.id} to={`/post/${post.id}`}>
                                    <Card interactive className="p-4">
                                        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            <Link
                                                to={`/s/${post.sub_syfse?.name}`}
                                                className="hover:underline"
                                                onClick={e =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                s/{post.sub_syfse?.name}
                                            </Link>{' '}
                                            • {formatTimeAgo(post.created_at)}
                                        </div>
                                        <h3 className="mb-2 font-semibold">
                                            {post.title}
                                        </h3>
                                        {post.image_url && (
                                            <div className="mb-2">
                                                <PostImage
                                                    url={post.image_url}
                                                    alt={post.title}
                                                    className="h-48 w-full bg-gray-100 object-cover dark:bg-gray-800"
                                                />
                                            </div>
                                        )}
                                        {post.content && (
                                            <p className="mb-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                                                {post.content}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                            <MessageSquare className="h-3 w-3" />
                                            <span>
                                                {post.comment_count} comments
                                            </span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                            {posts.length === 0 && (
                                <EmptyState message="No posts yet" />
                            )}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {comments.map(comment => (
                                <Link
                                    key={comment.id}
                                    to={`/post/${comment.post?.id}`}
                                >
                                    <Card interactive className="p-4">
                                        <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                                            on "{comment.post?.title}" •{' '}
                                            {formatTimeAgo(comment.created_at)}
                                        </div>
                                        <p className="whitespace-pre-wrap text-sm">
                                            {comment.content}
                                        </p>
                                    </Card>
                                </Link>
                            ))}
                            {comments.length === 0 && (
                                <EmptyState message="No comments yet" />
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export function UserProfile() {
    const { profile, refreshProfile } = useAuth()
    const [posts, setPosts] = useState<Post[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')
    const [uploading, setUploading] = useState(false)

    const loadUserContent = useCallback(async () => {
        if (!profile) return

        try {
            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select(
                    `
          *,
          sub_syfse:sub_syfses!sub_id(name)
        `
                )
                .eq('author_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (postsError) throw postsError

            const postsWithCounts = await Promise.all(
                (postsData || []).map(async post => {
                    const { count } = await supabase
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', post.id)

                    return {
                        ...post,
                        comment_count: count || 0,
                    }
                })
            )

            setPosts(postsWithCounts)

            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select(
                    `
          *,
          post:posts!post_id(title, id)
        `
                )
                .eq('author_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (commentsError) throw commentsError
            setComments(commentsData || [])
        } catch (err) {
            console.error('Error loading user content:', err)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        if (profile) {
            loadUserContent()
        }
    }, [profile, loadUserContent])

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)

            if (!event.target.files || event.target.files.length === 0) {
                return
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${profile!.id}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('syfse-media')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                throw uploadError
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: filePath })
                .eq('id', profile!.id)

            if (updateError) {
                throw updateError
            }

            await refreshProfile()
        } catch (error) {
            alert('Error uploading avatar!')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    if (!profile) {
        return null
    }

    return (
        <ProfileContent
            profile={profile}
            posts={posts}
            comments={comments}
            loading={loading}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOwnProfile={true}
            onAvatarUpload={uploadAvatar}
            uploading={uploading}
        />
    )
}

export function PublicUserProfile() {
    const { username } = useParams<{ username: string }>()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

    const loadProfile = useCallback(async () => {
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .maybeSingle()

            if (profileError) throw profileError
            if (!profileData) {
                setLoading(false)
                return
            }

            setProfile(profileData)

            const { data: postsData, error: postsError } = await supabase
                .from('posts')
                .select(
                    `
          *,
          sub_syfse:sub_syfses!sub_id(name)
        `
                )
                .eq('author_id', profileData.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (postsError) throw postsError

            const postsWithCounts = await Promise.all(
                (postsData || []).map(async post => {
                    const { count } = await supabase
                        .from('comments')
                        .select('*', { count: 'exact', head: true })
                        .eq('post_id', post.id)

                    return {
                        ...post,
                        comment_count: count || 0,
                    }
                })
            )

            setPosts(postsWithCounts)

            const { data: commentsData, error: commentsError } = await supabase
                .from('comments')
                .select(
                    `
          *,
          post:posts!post_id(title, id)
        `
                )
                .eq('author_id', profileData.id)
                .order('created_at', { ascending: false })
                .limit(10)

            if (commentsError) throw commentsError
            setComments(commentsData || [])
        } catch (err) {
            console.error('Error loading profile:', err)
        } finally {
            setLoading(false)
        }
    }, [username])

    useEffect(() => {
        if (username) {
            loadProfile()
        }
    }, [username, loadProfile])

    if (loading) {
        return <Loading message="Loading profile..." />
    }

    if (!profile) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                    User not found
                </p>
                <BackButton to="/" className="mt-4 inline-flex" />
            </div>
        )
    }

    return (
        <>
            <BackButton to="/" />
            <ProfileContent
                profile={profile}
                posts={posts}
                comments={comments}
                loading={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
        </>
    )
}
