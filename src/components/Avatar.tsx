import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from 'lucide-react';

interface AvatarProps {
  url: string | null;
  size?: number;
  username?: string | null;
  className?: string;
}

export function Avatar({ url, size = 10, username, className = '' }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url) {
      downloadImage(url);
    } else {
      setAvatarUrl(null);
    }
  }, [url]);

  async function downloadImage(path: string) {
    try {
      if (path.startsWith('http')) {
        setAvatarUrl(path);
        return;
      }
      
      const { data, error } = await supabase.storage.from('syfse-media').download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.log('Error downloading image: ', error);
    }
  }

  // Calculate dimensions based on size prop (tailwind w-X h-X)
  // Since we can't easily map number to tailwind class dynamically without a huge map,
  // we might accept pixel size or just use style.
  // Ideally we use tailwind classes passed in className, but for default size we can use style.

  const sizeStyle = { width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }; // converting tailwind spacing unit roughly

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username || 'Avatar'}
        className={`rounded-full object-cover bg-gray-200 dark:bg-gray-800 ${className}`}
        style={className ? {} : sizeStyle}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-green-600 flex items-center justify-center text-white font-medium ${className}`}
      style={className ? {} : sizeStyle}
    >
      {username ? (
        <span style={{ fontSize: `${size * 0.125}rem` }}>
          {username.substring(0, 2).toUpperCase()}
        </span>
      ) : (
        <User style={{ width: '50%', height: '50%' }} />
      )}
    </div>
  );
}
