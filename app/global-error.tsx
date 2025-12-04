"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Critical Error</h2>
          <p className="text-muted-foreground mb-8">
            Something went wrong with the application layout.
          </p>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  )
}
