import React, { useState, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-2a4d9f8770e7?q=80&w=2669&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
]

interface HeroSearchProps {
  onSearch: (filters: { location: string; type: string }) => void
}

export function HeroSearch({ onSearch }: HeroSearchProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<"buy" | "rent" | "sell" | "pre-approval" | "just-sold" | "home-value">("buy")
  const [searchValue, setSearchValue] = useState("")
  const [isCompact, setIsCompact] = useState(false)

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handle scroll for sticky/compact mode
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      // Threshold: when scroll passes ~100px, switch to compact
      setIsCompact(scrollPosition > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    // Map tabs to filter types
    let type = "all"
    if (activeTab === "buy") type = "sale"
    if (activeTab === "rent") type = "rent"
    
    onSearch({
      location: searchValue,
      type,
    })
  }

  const handleClear = () => {
    setSearchValue("")
    // Map tabs to filter types
    let type = "all"
    if (activeTab === "buy") type = "sale"
    if (activeTab === "rent") type = "rent"
    
    onSearch({
      location: "",
      type,
    })
  }

  return (
    <>
      {/* Placeholder to prevent layout shift when fixed */}
      <div 
        className={cn(
          "w-full transition-all duration-0",
          isCompact ? "h-[300px] sm:h-[400px]" : "h-0"
        )} 
      />

      <div 
        className={cn(
          "w-full flex flex-col items-center justify-center text-white overflow-hidden transition-all duration-500 ease-in-out z-40 shadow-md",
          isCompact 
            ? "fixed top-[68px] left-0 right-0 h-[80px] bg-primary/95 backdrop-blur-md" 
            : "relative h-[300px] sm:h-[400px]"
        )}
      >
        {/* Background Images - Fade out in compact mode */}
        <div className={cn("absolute inset-0 transition-opacity duration-500", isCompact ? "opacity-0" : "opacity-100")}>
          {BACKGROUND_IMAGES.map((src, index) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className={cn(
          "relative z-10 w-full px-4 text-center transition-all duration-500 flex flex-col items-center",
          isCompact ? "flex-row justify-between max-w-7xl mx-auto" : "max-w-4xl"
        )}>
          
          {/* Title & Tabs - Hide in compact mode */}
          <div className={cn(
            "transition-all duration-300 overflow-hidden",
            isCompact ? "h-0 opacity-0 w-0" : "h-auto opacity-100 w-full mb-6"
          )}>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 drop-shadow-md">
              AI-powered Real Estate site 
            </h1>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 drop-shadow-md">
               Trusted by industry players
            </h1>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm sm:text-base font-medium">
              {[
                { id: "buy", label: "Buy" },
                { id: "rent", label: "Rent" },
                { id: "sell", label: "Sell" },
                { id: "pre-approval", label: "Pre-approval" },
                { id: "just-sold", label: "Just sold" },
                { id: "home-value", label: "Home value" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "relative pb-1 transition-colors hover:text-white/80",
                    activeTab === tab.id
                      ? "text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-white"
                      : "text-white/90"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className={cn(
            "relative transition-all duration-500",
            isCompact ? "w-full max-w-3xl mx-auto" : "w-full max-w-2xl mx-auto"
          )}>
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Address, School, City, Zip or Neighborhood"
                className={cn(
                  "w-full pl-6 pr-24 rounded-full bg-white text-gray-900 placeholder:text-gray-500 border-none shadow-lg focus-visible:ring-0 text-base transition-all duration-300",
                  isCompact ? "h-12" : "h-14"
                )}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    "absolute p-2 text-gray-400 hover:text-gray-600 transition-colors",
                    isCompact ? "right-12" : "right-14"
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                type="submit"
                size="icon"
                className={cn(
                  "absolute right-2 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all duration-300",
                  isCompact ? "h-9 w-9" : "h-10 w-10"
                )}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
