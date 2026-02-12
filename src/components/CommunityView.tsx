import { useEffect, useState } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostsFeed } from './PostsFeed';
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
        <div className="text-gray-500 dark:text-gray-400">Loading community...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Community not found</p>
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

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-green-600" />
              <h1 className="text-2xl font-bold">s/{community.name}</h1>
            </div>
            {community.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {community.description}
              </p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {community.member_count} {community.member_count === 1 ? 'member' : 'members'}
            </div>
          </div>
          {profile && (
            <button
              onClick={community.is_member ? handleLeave : handleJoin}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                community.is_member
                  ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {community.is_member ? 'Leave' : 'Join'}
            </button>
          )}
        </div>
      </div>

      <PostsFeed communityId={communityId} onSelectPost={onSelectPost} />
    </div>
  );
}
