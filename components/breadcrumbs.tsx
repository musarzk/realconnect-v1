"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs() {
  const pathname = usePathname();
  
  if (pathname === "/") return null;

  const paths = pathname.split("/").filter(Boolean);
  
  return (
    <nav className="flex mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-none" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link
            href="/"
            className="flex items-center hover:text-primary transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

          return (
            <li key={path} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              {isLast ? (
                <span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-none">
                  {label}
                </span>
              ) : (
                <Link
                  href={href}
                  className="hover:text-primary transition-colors truncate max-w-[120px] sm:max-w-none"
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
