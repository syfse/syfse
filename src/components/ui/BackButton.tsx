import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../lib/utils'

interface BackButtonProps {
    to?: string
    onClick?: () => void
    className?: string
}

export function BackButton({ to, onClick, className }: BackButtonProps) {
    const navigate = useNavigate()

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else if (to) {
            navigate(to)
        } else {
            navigate(-1)
        }
    }

    return (
        <button
            onClick={handleClick}
            className={cn(
                'mb-4 flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100',
                className
            )}
        >
            <ArrowLeft className="h-4 w-4" />
            Back
        </button>
    )
}
