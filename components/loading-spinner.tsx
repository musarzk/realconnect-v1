/**
 * Modern Loading Component
 * Provides multiple loading states with smooth animations
 */

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary animate-spin"></div>

          {/* Inner pulsing dot */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-3 border-gray-200 border-t-primary animate-spin"></div>
          <div className="absolute inset-1 rounded-full border-3 border-transparent border-b-primary/50 animate-spin" style={{ animationDirection: "reverse" }}></div>
        </div>
        <p className="text-xs text-muted-foreground">Loading data...</p>
      </div>
    </div>
  )
}

export function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  )
}

export function LoadingBar() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse" style={{
            backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 2s infinite"
          }}></div>
        </div>
        <p className="text-xs text-center text-muted-foreground">Please wait...</p>
      </div>
    </div>
  )
}

export function LoadingGrid() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            style={{
              animation: "pulse 1.4s infinite",
              animationDelay: `${i * 0.2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function LoadingWave() {
  return (
    <div className="flex items-center justify-center gap-1 py-8">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-primary"
          style={{
            height: `${12 + i * 4}px`,
            animation: "wave 1s infinite",
            animationDelay: `${i * 0.1}s`
          }}
        ></div>
      ))}
    </div>
  )
}

export function LoadingInline() {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative w-4 h-4">
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary animate-spin"></div>
      </div>
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  )
}

export function LoadingButton() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm font-medium">Processing...</span>
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-4 py-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
        </div>
      ))}
    </div>
  )
}
