'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type SeparatorProps = {
  className?: string
  orientation?: 'horizontal' | 'vertical'
  decorative?: boolean
} & React.HTMLAttributes<HTMLDivElement>

function Separator({ className, orientation = 'horizontal', decorative = true, ...props }: SeparatorProps) {
  // When decorative is false we expose a separator role for accessibility.
  const role = decorative ? undefined : 'separator'

  return (
    <div
      data-slot="separator"
      data-orientation={orientation}
      role={role}
      className={cn(
        'bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
