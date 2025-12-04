import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'placeholder:text-muted-foreground dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md bg-transparent px-3 py-2 text-base shadow-xs transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-b border-border/30 focus-visible:border-b-2 focus-visible:border-primary/50',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
