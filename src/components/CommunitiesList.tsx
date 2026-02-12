import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Textarea, Alert, Loading, EmptyState } from './ui';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'] & {
  member_count?: number;
  is_member?: boolean;
};

export function CommunitiesList() {
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
    return <Loading message="Loading communities..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Communities</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      {showCreateForm && (
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create a New Community</h2>
          {error && <Alert className="mb-4">{error}</Alert>}
          <form onSubmit={handleCreateCommunity} className="space-y-4">
            <Input
              id="name"
              label="Community Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Textarea
              id="description"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {communities.map((community) => (
          <Card key={community.id} interactive className="p-5">
            <div className="flex items-start justify-between gap-4">
              <Link to={`/s/${community.name}`} className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-lg">s/{community.name}</h3>
                </div>
                {community.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {community.description}
                  </p>
                )}
              </Link>
              {profile && (
                <Button
                  variant={community.is_member ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() =>
                    community.is_member
                      ? handleLeaveCommunity(community.id)
                      : handleJoinCommunity(community.id)
                  }
                >
                  {community.is_member ? 'Leave' : 'Join'}
                </Button>
              )}
            </div>
          </Card>
        ))}

        {communities.length === 0 && (
          <EmptyState message="No communities yet. Create the first one!" />
        )}
      </div>
    </div>
  );
}
