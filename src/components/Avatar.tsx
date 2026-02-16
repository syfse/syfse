import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { User } from 'lucide-react'
import { cn } from '../lib/utils'

interface AvatarProps {
    url: string | null
    size?: number
    username?: string | null
    className?: string
}

export function Avatar({ url, size = 10, username, className }: AvatarProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

    useEffect(() => {
        if (url) {
            downloadImage(url)
        } else {
            setAvatarUrl(null)
        }
    }, [url])

    async function downloadImage(path: string) {
        try {
            if (path.startsWith('http')) {
                setAvatarUrl(path)
                return
            }

            const { data, error } = await supabase.storage
                .from('syfse-media')
                .download(path)
            if (error) {
                throw error
            }
            const url = URL.createObjectURL(data)
            setAvatarUrl(url)
        } catch (error) {
            console.log('Error downloading image: ', error)
        }
    }

    const sizeStyle = {
        width: `${size * 0.25}rem`,
        height: `${size * 0.25}rem`,
    }

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={username || 'Avatar'}
                className={cn(
                    'bg-gray-200 object-cover dark:bg-gray-800',
                    className
                )}
                style={className ? {} : sizeStyle}
            />
        )
    }

    return (
        <div
            className={cn(
                'flex items-center justify-center bg-green-600 font-medium text-white',
                className
            )}
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
    )
}
