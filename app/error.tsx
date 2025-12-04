"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-destructive/10 p-6 rounded-full mb-6">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          We encountered an unexpected error. Our team has been notified.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()} variant="default">
            Try again
          </Button>
          <Button onClick={() => window.location.href = "/"} variant="outline">
            Go Home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-muted rounded-lg max-w-2xl w-full text-left overflow-auto">
            <p className="font-mono text-xs text-destructive">{error.message}</p>
            <pre className="mt-2 text-xs text-muted-foreground">{error.stack}</pre>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
