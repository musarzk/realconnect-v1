"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/* =========================================================
   BACKGROUND IMAGES
========================================================= */

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-2a4d9f8770e7?q=80&w=2669&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2653&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2670&auto=format&fit=crop",
];

/* =========================================================
   TAB TYPES
========================================================= */

type TabType =
  | "buy"
  | "rent"
  | "sell"
  | "invest"
  | "earn"
  | "evaluate";

/* =========================================================
   PROPS
========================================================= */

interface HeroSearchProps {
  onSearch: (filters: {
    location: string;
    type: string;
  }) => void;
}

/* =========================================================
   COMPONENT
========================================================= */

export function HeroSearch({ onSearch }: HeroSearchProps) {
  /* =====================================================
     STATES
  ===================================================== */

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("buy");
  const [searchValue, setSearchValue] = useState("");
  const [isCompact, setIsCompact] = useState(false);

  /* =====================================================
     BACKGROUND IMAGE ROTATION
  ===================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prev) => (prev + 1) % BACKGROUND_IMAGES.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     SMOOTH SCROLL DETECTION
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      // Show compact bar when scrolled past the hero's main content area
      const shouldCompact = window.scrollY > 300;
      setIsCompact(shouldCompact);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* =====================================================
     SEARCH HANDLER
  ===================================================== */

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    let type = "all";
    switch (activeTab) {
      case "buy": type = "sale"; break;
      case "rent": type = "rent"; break;
      case "sell": type = "sell"; break;
      case "invest": type = "investment"; break;
      case "earn": type = "earning"; break;
      case "evaluate": type = "valuation"; break;
      default: type = "all";
    }

    onSearch({
      location: searchValue.trim(),
      type,
    });
  };

  /* =====================================================
     CLEAR SEARCH
  ===================================================== */

  const handleClear = () => {
    setSearchValue("");
    onSearch({
      location: "",
      type: "all",
    });
  };

  /* =====================================================
     TAB CONFIG
  ===================================================== */

  const tabs: {
    id: TabType;
    label: string;
  }[] = [
    { id: "buy", label: "Buy" },
    { id: "sell", label: "Sell" },
    { id: "rent", label: "Rent" },
    { id: "invest", label: "Invest" },
    { id: "earn", label: "Earn" },
    { id: "evaluate", label: "Evaluate" },
  ];

  /* =====================================================
     JSX
  ===================================================== */

  return (
    <>
      {/* =================================================
          1. MAIN HERO (Always in document flow)
      ================================================= */}
      <div className="relative w-full h-[320px] sm:h-[420px] flex flex-col items-center justify-center overflow-hidden z-30">
        
        {/* Background Images */}
        <div className="absolute inset-0">
          {BACKGROUND_IMAGES.map((src, index) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out",
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              )}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full px-6 md:px-8 flex flex-col items-center justify-center text-center max-w-4xl h-full mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-xl text-white">
            AI-powered Real Estate Site
          </h1>
          <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-8 drop-shadow-xl text-white">
            Trusted by Industry Players
          </h2>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-7 text-sm sm:text-base font-medium mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative pb-1 transition-all duration-300",
                  activeTab === tab.id
                    ? "text-white after:absolute after:left-0 after:bottom-0 after:w-full after:h-0.5 after:bg-white"
                    : "text-white/80 hover:text-white"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Address, City or Neighborhood"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full rounded-full bg-white text-gray-900 placeholder:text-gray-500 border-none shadow-2xl focus-visible:ring-0 h-14 pl-7 pr-28 text-base"
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-16 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* =================================================
          2. COMPACT STICKY SEARCH BAR
      ================================================= */}
      <div
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "top-[72px] md:top-20", // Adjust this based on your navbar height to prevent hiding under it
          isCompact
            ? "translate-y-0 opacity-100 shadow-2xl"
            : "-translate-y-[150%] opacity-0 pointer-events-none"
        )}
      >
        <div className="w-full h-[70px] sm:h-[85px] bg-primary/95 backdrop-blur-xl border-b border-white/10 flex items-center justify-center px-6 md:px-8 pt-2 sm:pt-3">
          <form onSubmit={handleSearch} className="w-full max-w-4xl relative flex items-center">
            <Input
              type="text"
              placeholder="Address, City or Neighborhood"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full h-12 pl-6 pr-24 text-sm rounded-full bg-white text-gray-900 placeholder:text-gray-500 border-none shadow-inner focus-visible:ring-0"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-14 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <Button
              type="submit"
              size="icon"
              className="absolute right-1.5 h-9 w-9 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-300"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}