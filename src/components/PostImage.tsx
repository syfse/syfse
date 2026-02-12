import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface PostImageProps {
  url: string;
  alt: string;
  className?: string;
}

export function PostImage({ url, alt, className = '' }: PostImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (url) {
      downloadImage(url);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      setLoading(true);
      if (path.startsWith('http')) {
        setImageUrl(path);
        return;
      }
      
      const { data, error } = await supabase.storage.from('syfse-media').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setImageUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`} />
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
    />
  );
}
