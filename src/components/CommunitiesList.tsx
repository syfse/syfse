import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Users, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import SpotlightCard from './SpotlightCard'
import AnimatedContent from './AnimatedContent'
import Magnet from './Magnet'
import type { Database } from '../lib/database.types'

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
    member_count?: number
    is_member?: boolean
}

export function CommunitiesList() {
    const [communities, setCommunities] = useState<SubSyfse[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')
    const { profile } = useAuth()

    const loadCommunities = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('sub_syfses')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (profile) {
                const { data: memberships } = await supabase
                    .from('sub_syfse_members')
                    .select('sub_id')
                    .eq('user_id', profile.id)

                const memberSubIds = new Set(
                    memberships?.map(m => m.sub_id) || []
                )

                const enrichedData = data.map(sub => ({
                    ...sub,
                    is_member: memberSubIds.has(sub.id),
                }))

                setCommunities(enrichedData)
            } else {
                setCommunities(data || [])
            }
        } catch (err) {
            console.error('Error loading communities:', err)
        } finally {
            setLoading(false)
        }
    }, [profile])

    useEffect(() => {
        loadCommunities()
    }, [loadCommunities])

    const handleCreateCommunity = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setCreating(true)

        try {
            if (!profile) throw new Error('You must be logged in')

            const { error } = await supabase.from('sub_syfses').insert({
                name,
                description,
                creator_id: profile.id,
            })

            if (error) throw error

            setName('')
            setDescription('')
            setShowCreateForm(false)
            loadCommunities()
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to create community'
            )
        } finally {
            setCreating(false)
        }
    }

    const handleJoinCommunity = async (subId: string) => {
        if (!profile) return

        try {
            const { error } = await supabase.from('sub_syfse_members').insert({
                sub_id: subId,
                user_id: profile.id,
            })

            if (error) throw error
            loadCommunities()
        } catch (err) {
            console.error('Error joining community:', err)
        }
    }

    const handleLeaveCommunity = async (subId: string) => {
        if (!profile) return

        try {
            const { error } = await supabase
                .from('sub_syfse_members')
                .delete()
                .eq('sub_id', subId)
                .eq('user_id', profile.id)

            if (error) throw error
            loadCommunities()
        } catch (err) {
            console.error('Error leaving community:', err)
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
                    Loading communities...
                </div>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl">
            <AnimatedContent distance={30} duration={0.5}>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">
                            Communities
                        </h1>
                        <p className="text-gray-500">
                            Discover and join communities
                        </p>
                    </div>
                    <Magnet padding={40} magnetStrength={3}>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create Community
                        </button>
                    </Magnet>
                </div>
            </AnimatedContent>

            {showCreateForm && (
                <AnimatedContent distance={20} duration={0.4}>
                    <SpotlightCard
                        className="mb-6 !rounded-2xl !border-gray-200 !bg-white/90 backdrop-blur-sm"
                        spotlightColor="rgba(34, 197, 94, 0.1)"
                    >
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">
                            Create a New Community
                        </h2>
                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}
                        <form
                            onSubmit={handleCreateCommunity}
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="name"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Community Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="my-awesome-community"
                                    required
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={e =>
                                        setDescription(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="What's your community about?"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/20 transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </SpotlightCard>
                </AnimatedContent>
            )}

            <div className="space-y-4">
                {communities.map((community, index) => (
                    <AnimatedContent
                        key={community.id}
                        distance={40}
                        duration={0.6}
                        delay={index * 0.1}
                    >
                        <SpotlightCard
                            className="!rounded-2xl !border-gray-200 !bg-white/80 !p-5 backdrop-blur-sm transition-all hover:!border-green-300 hover:shadow-lg hover:shadow-green-500/10"
                            spotlightColor="rgba(34, 197, 94, 0.1)"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <Link
                                    to={`/s/${community.name}`}
                                    className="flex-1 text-left"
                                >
                                    <div className="mb-2 flex items-center gap-2">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                                            <Users className="h-5 w-5 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            s/{community.name}
                                        </h3>
                                    </div>
                                    {community.description && (
                                        <p className="ml-12 line-clamp-2 text-sm text-gray-600">
                                            {community.description}
                                        </p>
                                    )}
                                </Link>
                                {profile && (
                                    <Magnet padding={20} magnetStrength={4}>
                                        <button
                                            onClick={() =>
                                                community.is_member
                                                    ? handleLeaveCommunity(
                                                          community.id
                                                      )
                                                    : handleJoinCommunity(
                                                          community.id
                                                      )
                                            }
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                                community.is_member
                                                    ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-green-700'
                                            }`}
                                        >
                                            {community.is_member
                                                ? 'Leave'
                                                : 'Join'}
                                        </button>
                                    </Magnet>
                                )}
                            </div>
                        </SpotlightCard>
                    </AnimatedContent>
                ))}

                {communities.length === 0 && (
                    <SpotlightCard
                        className="!rounded-2xl !border-gray-200 !bg-white/80 backdrop-blur-sm"
                        spotlightColor="rgba(34, 197, 94, 0.1)"
                    >
                        <div className="py-12 text-center text-gray-500">
                            No communities yet. Create the first one!
                        </div>
                    </SpotlightCard>
                )}
            </div>
        </div>
    )
}
