/* =========================================================
   IMPROVED SMOOTH STICKY HERO SEARCH
   - smoother compact transition
   - reduced jumpiness
   - added top margin
   - optimized scroll handling
   - added transform animations
========================================================= */

"use client";

import React, { useState, useEffect, useRef } from "react";
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

  /*
   Controls sticky compact mode
  */
  const [isCompact, setIsCompact] = useState(false);

  /*
   Used to prevent excessive rerenders during scroll
  */
  const ticking = useRef(false);

  /* =====================================================
     BACKGROUND IMAGE ROTATION
  ===================================================== */

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prev) => (prev + 1) % BACKGROUND_IMAGES.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* =====================================================
     SMOOTH STICKY SCROLL EFFECT
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      /*
       Prevent too many scroll updates
      */
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;

          /*
           Increased threshold
           prevents aggressive snapping
          */
          const shouldCompact = scrollPosition > 100;

          /*
           Only update state if changed
           prevents unnecessary rerenders
          */
          setIsCompact((prev) => {
            if (prev !== shouldCompact) {
              return shouldCompact;
            }
            return prev;
          });

          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    /*
     Passive improves performance
    */
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* =====================================================
     SEARCH HANDLER
  ===================================================== */

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    let type = "all";

    switch (activeTab) {
      case "buy":
        type = "sale";
        break;

      case "rent":
        type = "rent";
        break;

      case "sell":
        type = "sell";
        break;

      case "invest":
        type = "investment";
        break;

      case "earn":
        type = "earning";
        break;

      case "evaluate":
        type = "valuation";
        break;

      default:
        type = "all";
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
          PLACEHOLDER SPACER
      ================================================= */}

      <div
        className={cn(
          "w-full transition-all duration-500 ease-in-out",
          isCompact
            ? "h-[320px] sm:h-[420px]"
            : "h-0"
        )}
      />

      {/* =================================================
          HERO CONTAINER
      ================================================= */}

      <div
        className={cn(
          /*
           Base styles
          */
          "w-full flex flex-col items-center justify-center text-white overflow-hidden z-40",

          /*
           VERY smooth transitions
          */
          "transition-[height,transform,background-color,backdrop-filter,box-shadow,border-radius]",

          "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",

          /*
           Compact sticky mode
          */
          isCompact
            ? `
              fixed
              top-20
              left-4
              right-4
              h-[85px]
              rounded-2xl
              bg-primary/85
              backdrop-blur-xl
              shadow-2xl
              border
              border-white/10
            `
            : `
              relative
              h-[320px]
              sm:h-[420px]
              rounded-none
            `
        )}
      >
        {/* =============================================
            BACKGROUND IMAGES
        ============================================== */}

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-700",

            isCompact
              ? "opacity-0 scale-110"
              : "opacity-100 scale-100"
          )}
        >
          {BACKGROUND_IMAGES.map((src, index) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-in-out",

                index === currentImageIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              )}
              style={{
                backgroundImage: `url(${src})`,
              }}
            />
          ))}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/45" />
        </div>

        {/* =============================================
            CONTENT
        ============================================== */}

        <div
          className={cn(
            "relative z-10 w-full px-4 transition-all duration-700 ease-out",

            isCompact
              ? `
                flex
                flex-row
                items-center
                justify-center
                h-full
                max-w-6xl
                mx-auto
              `
              : `
                flex
                flex-col
                items-center
                justify-center
                text-center
                max-w-4xl
                h-full
                mx-auto
              `
          )}
        >
          {/* =========================================
              HERO TEXT + TABS
          ========================================== */}

          <div
            className={cn(
              "transition-all duration-500 overflow-hidden",

              isCompact
                ? `
                  opacity-0
                  scale-95
                  h-0
                  w-0
                  -translate-y-4
                `
                : `
                  opacity-100
                  scale-100
                  w-full
                  mb-6
                  translate-y-0
                `
            )}
          >
            {/* MAIN TITLE */}

            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-bold mb-3 drop-shadow-xl">
              AI-powered Real Estate Site
            </h1>

            <h2 className="text-xl sm:text-4xl lg:text-5xl font-bold mb-8 drop-shadow-xl">
              Trusted by Industry Players
            </h2>

            {/* =====================================
                TABS
            ====================================== */}

            <div className="flex flex-wrap justify-center gap-4 sm:gap-7 text-sm sm:text-base font-medium">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative pb-1 transition-all duration-300",

                    activeTab === tab.id
                      ? `
                        text-white
                        after:absolute
                        after:left-0
                        after:bottom-0
                        after:w-full
                        after:h-0.5
                        after:bg-white
                      `
                      : "text-white/80 hover:text-white"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* =========================================
              SEARCH BAR
          ========================================== */}

          <form
            onSubmit={handleSearch}
            className={cn(
              "relative transition-all duration-700 ease-out",

              isCompact
                ? `
                  w-full
                  max-w-4xl
                  scale-100
                `
                : `
                  w-full
                  max-w-2xl
                `
            )}
          >
            <div className="relative flex items-center">
              {/* SEARCH INPUT */}

              <Input
                type="text"
                placeholder="Address, City or Neighborhood"
                aria-label="Search location"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className={cn(
                  `
                  w-full
                  rounded-full
                  bg-white
                  text-gray-900
                  placeholder:text-gray-500
                  border-none
                  shadow-2xl
                  transition-all
                  duration-500
                  focus-visible:ring-0
                  `,

                  isCompact
                    ? `
                      h-12
                      pl-6
                      pr-24
                      text-sm
                    `
                    : `
                      h-14
                      pl-7
                      pr-28
                      text-base
                    `
                )}
              />

              {/* CLEAR BUTTON */}

              {searchValue && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={handleClear}
                  className={cn(
                    "absolute text-gray-500 hover:text-gray-700 transition-colors",

                    isCompact
                      ? "right-14"
                      : "right-16"
                  )}
                >
                  <X className="h-5 w-5" />
                </button>
              )}

              {/* SEARCH BUTTON */}

              <Button
                type="submit"
                size="icon"
                aria-label="Search"
                className={cn(
                  `
                  absolute
                  right-2
                  rounded-full
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  transition-all
                  duration-500
                  shadow-lg
                  `,

                  isCompact
                    ? "h-9 w-9"
                    : "h-10 w-10"
                )}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}