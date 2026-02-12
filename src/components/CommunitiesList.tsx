import { useEffect, useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
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
        <div className="text-gray-500 dark:text-gray-400">Loading communities...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Community
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create a New Community</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Community Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {communities.map((community) => (
          <div
            key={community.id}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <button
                onClick={() => onSelectCommunity(community.id)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-lg">s/{community.name}</h3>
                </div>
                {community.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {community.description}
                  </p>
                )}
              </button>
              {profile && (
                <button
                  onClick={() =>
                    community.is_member
                      ? handleLeaveCommunity(community.id)
                      : handleJoinCommunity(community.id)
                  }
                  className={`px-4 py-1.5 text-sm font-medium transition-colors ${
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
        ))}

        {communities.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No communities yet. Create the first one!
          </div>
        )}
      </div>
    </div>
  );
}
