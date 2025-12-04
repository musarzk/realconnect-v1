import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-secondary/50 p-6 rounded-full mb-6">
          <FileQuestion className="h-16 w-16 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link href="/">
          <Button size="lg">
            Return Home
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  )
}
