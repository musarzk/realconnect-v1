"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false }) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon Graphic - logo2.png (House Roof) */}
      <div className="relative h-15 md:h-16 w-15 md:w-16 flex-shrink-0">
      <Image
            src="/logo2.png"
            alt="SmartReal Logo"
            width={200}
            height={60}
            className="h-10 md:h-16 w-auto object-contain"
          />
      </div>

      {/* Text Branding */}
      {!iconOnly && (
        <div className="flex flex-col leading-none pt-1">
          <div className="flex items-baseline">
            <span className="text-xl md:text-2xl font-black text-[#003399] tracking-tighter uppercase">REAL</span>
            <span className="text-xl md:text-2xl font-bold text-[#FF6600] tracking-tighter ml-0.5">connect</span>
          </div>
          <span className="text-[8px] md:text-[10px] font-bold text-gray-500 tracking-[0.21rem] ml-0.5 uppercase whitespace-nowrap">
            By SMARTFORCE
          </span>
        </div>
      )}
    </div>
  );
};
