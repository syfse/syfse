import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, id, children, ...props }, ref) => {
        return (
            <div>
                {label && (
                    <label
                        htmlFor={id}
                        className="mb-1.5 block text-sm font-medium"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-950',
                        className
                    )}
                    {...props}
                >
                    {children}
                </select>
            </div>
        )
    }
)

Select.displayName = 'Select'
