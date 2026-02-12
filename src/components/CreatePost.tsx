import { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type SubSyfse = Database['public']['Tables']['sub_syfses']['Row'];

interface CreatePostProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function CreatePost({ onBack, onSuccess }: CreatePostProps) {
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

      onSuccess();
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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
        <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

        {communities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You need to join a community before you can create a post.
            </p>
            <button
              onClick={onBack}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
            >
              Browse Communities
            </button>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="community" className="block text-sm font-medium mb-1.5">
                  Community
                </label>
                <select
                  id="community"
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                >
                  <option value="">Select a community</option>
                  {communities.map((community) => (
                    <option key={community.id} value={community.id}>
                      s/{community.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  required
                  maxLength={300}
                  placeholder="An interesting title"
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-1.5">
                  Content (optional)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Image (optional)</label>
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                      className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 dark:border-gray-800"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>



              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Posting...' : 'Post'}
                </button>
                <button
                  type="button"
                  onClick={onBack}
                  className="px-6 py-2.5 border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
