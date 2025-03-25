import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const notificationVariants = cva(
  "fixed top-4 left-1/2 transform -translate-x-1/2 w-full max-w-sm p-4 rounded-lg shadow-lg text-white flex items-center justify-between",
  {
    variants: {
      variant: {
        success: "bg-green-500",
        error: "bg-red-500",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
)

export interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationVariants> {
  message: string
  onClose?: () => void
  autoHideDuration?: number
}

export function NotificationBanner({
  className,
  variant,
  message,
  onClose,
  autoHideDuration = 5000,
  ...props
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, autoHideDuration)

    return () => clearTimeout(timer)
  }, [autoHideDuration, onClose])

  if (!isVisible) return null

  return (
    <div className={cn(notificationVariants({ variant }), className)} {...props}>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

