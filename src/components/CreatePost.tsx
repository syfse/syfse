import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { BackButton } from './ui'
import SpotlightCard from './SpotlightCard'
import AnimatedContent from './AnimatedContent'
import Magnet from './Magnet'
import type { Database } from '../lib/database.types'

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row']

export function CreatePost() {
    const navigate = useNavigate()
    const [communities, setCommunities] = useState<SubSyfse[]>([])
    const [selectedCommunity, setSelectedCommunity] = useState('')
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const { profile } = useAuth()
    const handleBack = () => navigate('/s')

    const loadCommunities = useCallback(async () => {
        try {
            if (!profile) return

            const { data: memberships, error: memberError } = await supabase
                .from('sub_syfse_members')
                .select('sub_id')
                .eq('user_id', profile.id)

            if (memberError) throw memberError

            const subIds = (memberships ?? [])
                .map(m => m.sub_id)
                .filter((id): id is string => Boolean(id))

            if (subIds.length === 0) {
                setCommunities([])
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('sub_syfses')
                .select('*')
                .in('id', subIds)
                .order('name')

            if (error) throw error
            setCommunities(data || [])
        } catch (err) {
            console.error('Error loading communities:', err)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        loadCommunities()
    }, [loadCommunities])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setError('')
        setSubmitting(true)

        try {
            let image_url = null
            if (image) {
                const fileExt = image.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('syfse-media')
                    .upload(filePath, image)

                if (uploadError) throw uploadError
                image_url = filePath
            }

            const { error } = await supabase.from('posts').insert({
                author_id: profile.id,
                sub_id: selectedCommunity,
                title,
                content: content || null,
                assets: image_url ? [image_url] : [],
            })

            if (error) throw error

            navigate('/')
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to create post'
            )
        } finally {
            setSubmitting(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImage(null)
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview)
            setImagePreview(null)
        }
    }

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
                    Loading...
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl">
            <AnimatedContent distance={30} duration={0.5}>
                <BackButton to="/s" className="mb-6" />
            </AnimatedContent>

            <AnimatedContent distance={40} duration={0.6} delay={0.1}>
                <SpotlightCard
                    className="!rounded-2xl !border-gray-200 !bg-white/90 backdrop-blur-sm"
                    spotlightColor="rgba(34, 197, 94, 0.1)"
                >
                    <h1 className="mb-6 text-2xl font-bold text-gray-900">
                        Create a Post
                    </h1>

                    {communities.length === 0 ? (
                        <div className="py-8 text-center">
                            <p className="mb-4 text-gray-500">
                                You need to join a community before you can
                                create a post.
                            </p>
                            <Magnet padding={30} magnetStrength={3}>
                                <button
                                    onClick={handleBack}
                                    className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700"
                                >
                                    Browse Communities
                                </button>
                            </Magnet>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label
                                        htmlFor="community"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Community
                                    </label>
                                    <select
                                        id="community"
                                        value={selectedCommunity}
                                        onChange={e =>
                                            setSelectedCommunity(e.target.value)
                                        }
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                    >
                                        <option value="">
                                            Select a community
                                        </option>
                                        {communities.map(community => (
                                            <option
                                                key={community.id}
                                                value={community.id}
                                            >
                                                s/{community.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="title"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Title
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                        required
                                        maxLength={300}
                                        placeholder="An interesting title"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="content"
                                        className="mb-2 block text-sm font-medium text-gray-700"
                                    >
                                        Content (optional)
                                    </label>
                                    <textarea
                                        id="content"
                                        value={content}
                                        onChange={e =>
                                            setContent(e.target.value)
                                        }
                                        rows={10}
                                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="What's on your mind?"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Image (optional)
                                    </label>
                                    {!imagePreview ? (
                                        <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 transition-all hover:border-green-300 hover:bg-gray-50">
                                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                                <ImageIcon className="mb-2 h-8 w-8 text-gray-400" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold text-green-600">
                                                        Click to upload
                                                    </span>{' '}
                                                    or drag and drop
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-auto max-h-96 w-full rounded-xl border border-gray-200 object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Magnet
                                        padding={20}
                                        magnetStrength={4}
                                        disabled={submitting}
                                    >
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                                        >
                                            {submitting ? 'Posting...' : 'Post'}
                                        </button>
                                    </Magnet>
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="rounded-xl border border-gray-200 px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </SpotlightCard>
            </AnimatedContent>
        </div>
    )
}
