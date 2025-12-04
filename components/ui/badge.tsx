import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none shadow-sm",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary/80 hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-white",
        destructive:
          "bg-destructive text-white hover:bg-destructive/80 hover:text-white",
        outline: "text-foreground shadow-md hover:text-white hover:bg-accent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
