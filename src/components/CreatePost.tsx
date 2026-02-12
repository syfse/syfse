import { useState, useEffect } from 'react';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SpotlightCard from './SpotlightCard';
import AnimatedContent from './AnimatedContent';
import Magnet from './Magnet';
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
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-green-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
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
          className="!bg-white/90 backdrop-blur-sm !border-gray-200 !rounded-2xl"
          spotlightColor="rgba(34, 197, 94, 0.1)"
        >
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Create a Post</h1>

          {communities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You need to join a community before you can create a post.
              </p>
              <Magnet padding={30} magnetStrength={3}>
                <button
                  onClick={onBack}
                  className="green-700 text-white text-sm font-medium transition-all rounded-xl shadow-lg shadow-green-500/20"
                >
                  Browse Communities
                </button>
              </Magnet>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="community" className="block text-sm font-medium mb-2 text-gray-700">
                    Community
                  </label>
                  <select
                    id="community"
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  <label htmlFor="title" className="block text-sm font-medium mb-2 text-gray-700">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    required
                    maxLength={300}
                    placeholder="An interesting title"
                  />
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium mb-2 text-gray-700">
                    Content (optional)
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-200 bg-white text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                    placeholder="What's on your mind?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Image (optional)</label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer hover:bg-gray-50 hover:border-green-300 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-green-600">Click to upload</span> or drag and drop
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
                        className="w-full h-auto max-h-96 object-contain rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <Magnet padding={20} magnetStrength={4} disabled={submitting}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold disabled:opacity-50 transition-all rounded-xl shadow-lg shadow-green-500/25"
                    >
                      {submitting ? 'Posting...' : 'Post'}
                    </button>
                  </Magnet>
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-3 border border-gray-200 font-medium hover:bg-gray-50 transition-all rounded-xl text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </SpotlightCard>
      </AnimatedContent>
    </div>
  );
}
