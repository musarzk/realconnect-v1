"use client"

import React from "react"
import Image from "next/image"

const PARTNERS = [
  { name: "TechCorp", logo: "/placeholder.svg?height=50&width=150&text=TechCorp" },
  { name: "RealEstate Pro", logo: "/placeholder.svg?height=50&width=150&text=RealEstate+Pro" },
  { name: "InvestFuture", logo: "/placeholder.svg?height=50&width=150&text=InvestFuture" },
  { name: "HomeFinder", logo: "/placeholder.svg?height=50&width=150&text=HomeFinder" },
  { name: "PropTech", logo: "/placeholder.svg?height=50&width=150&text=PropTech" },
  { name: "SmartLiving", logo: "/placeholder.svg?height=50&width=150&text=SmartLiving" },
  { name: "UrbanSpaces", logo: "/placeholder.svg?height=50&width=150&text=UrbanSpaces" },
  { name: "GreenBuild", logo: "/placeholder.svg?height=50&width=150&text=GreenBuild" },
]

export function PartnersCarousel() {
  return (
    <div className="w-full py-8 bg-white/50 backdrop-blur-sm border-y border-border/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-600">Trusted by Global Partners</h2>
      </div>

      <div className="relative flex overflow-x-hidden group">
        <div className="animate-scroll w-max whitespace-nowrap flex items-center gap-16 px-8">
          {/* First set of logos */}
          {PARTNERS.map((partner, index) => (
            <div key={`p1-${index}`} className="flex items-center justify-center min-w-[150px] transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <span className="text-xl font-bold text-foreground/80">{partner.name}</span>
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {PARTNERS.map((partner, index) => (
            <div key={`p2-${index}`} className="flex items-center justify-center min-w-[150px] transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <span className="text-xl font-bold text-foreground/80">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
