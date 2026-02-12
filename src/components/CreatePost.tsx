import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Card, Input, Textarea, Select, Alert, Loading, BackButton } from './ui';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'];

export function CreatePost() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<SubSyfse[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    loadCommunities();
  }, [profile]);

  const loadCommunities = async () => {
    try {
      if (!profile) return;

      const { data: memberships, error: memberError } = await supabase
        .from('sub_syfse_members')
        .select('sub_id')
        .eq('user_id', profile.id);

      if (memberError) throw memberError;

      const subIds = memberships?.map(m => m.sub_id) || [];

      if (subIds.length === 0) {
        setCommunities([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('sub_syfses')
        .select('*')
        .in('id', subIds)
        .order('name');

      if (error) throw error;
      setCommunities(data || []);
    } catch (err) {
      console.error('Error loading communities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setError('');
    setSubmitting(true);

    try {
      let image_url = null;
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('syfse-media')
          .upload(filePath, image);

        if (uploadError) throw uploadError;
        image_url = filePath;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: profile.id,
          sub_id: selectedCommunity,
          title,
          content: content || null,
          assets: image_url ? [image_url] : [],
        });

      if (error) throw error;

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton to="/" />

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

        {communities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You need to join a community before you can create a post.
            </p>
            <Button onClick={() => navigate('/s')}>
              Browse Communities
            </Button>
          </div>
        ) : (
          <>
            {error && <Alert className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Select
                id="community"
                label="Community"
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                required
              >
                <option value="">Select a community</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    s/{community.name}
                  </option>
                ))}
              </Select>

              <Input
                id="title"
                label="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={300}
                placeholder="An interesting title"
              />

              <Textarea
                id="content"
                label="Content (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="What's on your mind?"
              />

              <div>
                <label className="block text-sm font-medium mb-1.5">Image (optional)</label>
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
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
                      className="w-full h-auto max-h-96 object-contain border border-gray-200 dark:border-gray-800"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? 'Posting...' : 'Post'}
                </Button>
                <Button type="button" variant="secondary" size="lg" onClick={() => navigate('/')}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
