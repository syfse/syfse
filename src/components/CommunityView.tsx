import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { PostsFeed } from './PostsFeed';
import { Button, Card, Loading, BackButton } from './ui';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
  member_count?: number;
  is_member?: boolean;
};

export function CommunityView() {
  const { name } = useParams<{ name: string }>();
  const [community, setCommunity] = useState<SubSyfse | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (name) {
      loadCommunity();
    }
  }, [name, profile]);

  const loadCommunity = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_syfses')
        .select('*')
        .eq('name', name)
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
    return <Loading message="Loading community..." />;
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Community not found</p>
        <BackButton to="/s" className="mt-4 inline-flex" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton to="/s" />

      <Card className="p-6 mb-6">
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
            <Button
              variant={community.is_member ? 'secondary' : 'primary'}
              onClick={community.is_member ? handleLeave : handleJoin}
            >
              {community.is_member ? 'Leave' : 'Join'}
            </Button>
          )}
        </div>
      </Card>

      <PostsFeed communityId={community.id} />
    </div>
  );
}
