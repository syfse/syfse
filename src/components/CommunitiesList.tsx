import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
import Magnet from './Magnet';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
  member_count?: number;
  is_member?: boolean;
};

interface CommunitiesListProps {
  onSelectCommunity: (id: string) => void;
}

export function CommunitiesList({ onSelectCommunity }: CommunitiesListProps) {
  const [communities, setCommunities] = useState<SubSyfse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    loadCommunities();
  }, [profile]);

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('sub_syfses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (profile) {
        const { data: memberships } = await supabase
          .from('sub_syfse_members')
          .select('sub_id')
          .eq('user_id', profile.id);

        const memberSubIds = new Set(memberships?.map(m => m.sub_id) || []);

        const enrichedData = data.map(sub => ({
          ...sub,
          is_member: memberSubIds.has(sub.id),
        }));

        setCommunities(enrichedData);
      } else {
        setCommunities(data || []);
      }
    } catch (err) {
      console.error('Error loading communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      if (!profile) throw new Error('You must be logged in');

      const { error } = await supabase
        .from('sub_syfses')
        .insert({
          name,
          description,
          creator_id: profile.id,
        });

      if (error) throw error;

      setName('');
      setDescription('');
      setShowCreateForm(false);
      loadCommunities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create community');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCommunity = async (subId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('sub_syfse_members')
        .insert({
          sub_id: subId,
          user_id: profile.id,
        });

      if (error) throw error;
      loadCommunities();
    } catch (err) {
      console.error('Error joining community:', err);
    }
  };

  const handleLeaveCommunity = async (subId: string) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('sub_syfse_members')
        .delete()
        .eq('sub_id', subId)
        .eq('user_id', profile.id);

      if (error) throw error;
      loadCommunities();
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
          Loading communities...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <AnimatedContent distance={30} duration={0.5}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Communities</h1>
            <p className="text-gray-500">Discover and join communities</p>
          </div>
          <Magnet padding={40} magnetStrength={3}>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium flex items-center gap-2 transition-all rounded-xl shadow-lg shadow-green-500/20"
            >
              <Plus className="w-4 h-4" />
              Create Community
            </button>
          </Magnet>
        </div>
      </AnimatedContent>

      {showCreateForm && (
        <AnimatedContent distance={20} duration={0.4}>
          <SpotlightCard 
            className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl mb-6"
            spotlightColor="rgba(34, 197, 94, 0.1)"
          >
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Create a New Community</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
            <form onSubmit={handleCreateCommunity} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-700">
                  Community Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="my-awesome-community"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                  placeholder="What's your community about?"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-medium disabled:opacity-50 transition-all rounded-xl shadow-lg shadow-green-500/20"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-2.5 border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-all rounded-xl text-gray-700"
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
          <AnimatedContent key={community.id} distance={40} duration={0.6} delay={index * 0.1}>
            <SpotlightCard
              className="!bg-white/80 backdrop-blur-sm !border-gray-200 !rounded-2xl !p-5 hover:!border-green-300 transition-all hover:shadow-lg hover:shadow-green-500/10"
              spotlightColor="rgba(34, 197, 94, 0.1)"
            >
              <div className="flex items-start justify-between gap-4">
                <button
                  onClick={() => onSelectCommunity(community.id)}
                  className="flex-1 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900">s/{community.name}</h3>
                  </div>
                  {community.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 ml-12">
                      {community.description}
                    </p>
                  )}
                </button>
                {profile && (
                  <Magnet padding={20} magnetStrength={4}>
                    <button
                      onClick={() =>
                        community.is_member
                          ? handleLeaveCommunity(community.id)
                          : handleJoinCommunity(community.id)
                      }
                      className={`px-4 py-2 text-sm font-medium transition-all rounded-xl ${
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
        ))}

        {communities.length === 0 && (
          <SpotlightCard
            className="!bg-white/80 backdrop-blur-sm !border-gray-200 !rounded-2xl"
            spotlightColor="rgba(34, 197, 94, 0.1)"
          >
            <div className="text-center py-12 text-gray-500">
              No communities yet. Create the first one!
            </div>
          </SpotlightCard>
        )}
      </div>
    </div>
  );
}
