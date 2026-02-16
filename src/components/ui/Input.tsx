import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, id, ...props }, ref) => {
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
                <input
                    ref={ref}
                    id={id}
                    className={cn(
                        'w-full border border-gray-300 bg-white px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600 dark:border-gray-700 dark:bg-gray-950',
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)

Input.displayName = 'Input'
