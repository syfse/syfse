import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostsFeed } from './PostsFeed';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
import Magnet from './Magnet';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
  member_count?: number;
  is_member?: boolean;
};

interface CommunityViewProps {
  communityId: string;
  onBack: () => void;
  onSelectPost: (id: string) => void;
}

export function CommunityView({ communityId, onBack, onSelectPost }: CommunityViewProps) {
  const [community, setCommunity] = useState<SubSyfse | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    loadCommunity();
  }, [communityId, profile]);

  const loadCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_syfses')
        .select('*')
        .eq('id', communityId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const { count } = await supabase
          .from('sub_syfse_members')
          .select('*', { count: 'exact', head: true })
          .eq('sub_id', data.id);

        let isMember = false;
        if (profile) {
          const { data: membership } = await supabase
            .from('sub_syfse_members')
            .select('id')
            .eq('sub_id', data.id)
            .eq('user_id', profile.id)
            .maybeSingle();

          isMember = !!membership;
        }

        setCommunity({
          ...data,
          member_count: count || 0,
          is_member: isMember,
        });
      }
    } catch (err) {
      console.error('Error loading community:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!profile || !community) return;

    try {
      const { error } = await supabase
        .from('sub_syfse_members')
        .insert({
          sub_id: community.id,
          user_id: profile.id,
        });

      if (error) throw error;
      loadCommunity();
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  const handleLeave = async () => {
    if (!profile || !community) return;

    try {
      const { error } = await supabase
        .from('sub_syfse_members')
        .delete()
        .eq('sub_id', community.id)
        .eq('user_id', profile.id);

      if (error) throw error;
      loadCommunity();
    } catch (err) {
      console.error('Error leaving community:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading community...
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Community not found</p>
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
          className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl mb-6"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">s/{community.name}</h1>
              </div>
              {community.description && (
                <p className="text-gray-600 mb-3 ml-15">
                  {community.description}
                </p>
              )}
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full w-fit">
                {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
              </div>
            </div>
            {profile && (
              <Magnet padding={30} magnetStrength={3}>
                <button
                  onClick={community.is_member ? handleLeave : handleJoin}
                  className={`px-5 py-2.5 text-sm font-medium transition-all rounded-xl ${
                    community.is_member
                      ? 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/20'
                  }`}
                >
                  {community.is_member ? 'Leave' : 'Join'}
                </button>
              </Magnet>
            )}
          </div>
        </SpotlightCard>
      </AnimatedContent>

      <PostsFeed communityId={communityId} onSelectPost={onSelectPost} />
    </div>
  );
}
