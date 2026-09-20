import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { clsx } from "clsx"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-white-50 text-black-950 hover:bg-white-200",
        secondary:
          "border-transparent bg-black-700 text-white-50 hover:bg-black-200",
        destructive:
          "border-transparent bg-danger-500 text-white hover:bg-danger-600",
        outline: "text-white-50 border-white-900",
        violet:
          "border-transparent bg-violet-600 text-white hover:bg-violet-700",
        coral:
          "border-transparent bg-coral-500 text-white hover:bg-coral-600",
        amber:
          "border-transparent bg-amber-400 text-white hover:bg-amber-500",
        cyan:
          "border-transparent bg-cyan-400 text-white hover:bg-cyan-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={clsx(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
