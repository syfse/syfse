import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { PostsFeed } from './PostsFeed'
import { BackButton } from './ui'
import SpotlightCard from './SpotlightCard'
import AnimatedContent from './AnimatedContent'
import Magnet from './Magnet'
import type { Database } from '../lib/database.types'

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
    member_count?: number
    is_member?: boolean
}

export function CommunityView() {
    const { name } = useParams<{ name: string }>()
    const navigate = useNavigate()
    const [community, setCommunity] = useState<SubSyfse | null>(null)
    const [loading, setLoading] = useState(true)
    const { profile } = useAuth()

    const loadCommunity = useCallback(async () => {
        if (!name) return
        try {
            const { data, error } = await supabase
                .from('sub_syfses')
                .select('*')
                .eq('name', name)
                .maybeSingle()

            if (error) throw error

            if (data) {
                const { count } = await supabase
                    .from('sub_syfse_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('sub_id', data.id)

                let isMember = false
                if (profile) {
                    const { data: membership } = await supabase
                        .from('sub_syfse_members')
                        .select('id')
                        .eq('sub_id', data.id)
                        .eq('user_id', profile.id)
                        .maybeSingle()

                    isMember = !!membership
                }

                setCommunity({
                    ...data,
                    member_count: count || 0,
                    is_member: isMember,
                })
            }
        } catch (err) {
            console.error('Error loading community:', err)
        } finally {
            setLoading(false)
        }
    }, [name, profile])

    useEffect(() => {
        if (name) {
            loadCommunity()
        }
    }, [name, loadCommunity])

    const handleJoin = async () => {
        if (!profile || !community) return

        try {
            const { error } = await supabase.from('sub_syfse_members').insert({
                sub_id: community.id,
                user_id: profile.id,
            })

            if (error) throw error
            loadCommunity()
        } catch (err) {
            console.error('Error joining community:', err)
        }
    }

    const handleLeave = async () => {
        if (!profile || !community) return

        try {
            const { error } = await supabase
                .from('sub_syfse_members')
                .delete()
                .eq('sub_id', community.id)
                .eq('user_id', profile.id)

            if (error) throw error
            loadCommunity()
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
                    Loading community...
                </div>
            </div>
        )
    }

    if (!community) {
        return (
            <div className="py-12 text-center">
                <p className="text-gray-500">Community not found</p>
                <button
                    onClick={() => navigate('/s')}
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
                <BackButton to="/s" className="mb-6" />
            </AnimatedContent>

            <AnimatedContent distance={40} duration={0.6} delay={0.1}>
                <SpotlightCard
                    className="mb-6 !rounded-2xl !border-gray-200 !bg-white/90 backdrop-blur-sm"
                    spotlightColor="rgba(34, 197, 94, 0.1)"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    s/{community.name}
                                </h1>
                            </div>
                            {community.description && (
                                <p className="ml-15 mb-3 text-gray-600">
                                    {community.description}
                                </p>
                            )}
                            <div className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
                                {community.member_count}{' '}
                                {community.member_count === 1
                                    ? 'member'
                                    : 'members'}
                            </div>
                        </div>
                        {profile && (
                            <Magnet padding={30} magnetStrength={3}>
                                <button
                                    onClick={
                                        community.is_member
                                            ? handleLeave
                                            : handleJoin
                                    }
                                    className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                                        community.is_member
                                            ? 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                                            : 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20 hover:from-green-600 hover:to-green-700'
                                    }`}
                                >
                                    {community.is_member ? 'Leave' : 'Join'}
                                </button>
                            </Magnet>
                        )}
                    </div>
                </SpotlightCard>
            </AnimatedContent>

            <PostsFeed communityId={community.id} />
        </div>
    )
}
