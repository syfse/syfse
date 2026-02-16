import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, interactive = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
                    interactive &&
                        'transition-colors hover:border-gray-300 dark:hover:border-gray-700',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'
