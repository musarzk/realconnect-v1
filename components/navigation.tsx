// "use client"

// import { Button } from "@/components/ui/button"
// import { Home } from "lucide-react"
// import Link from "next/link"

// export function Navigation() {
//   return (
//     <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
//         <Link href="/" className="flex items-center gap-2">
//           <Home className="h-6 w-6 text-primary" />
//           <span className="font-bold text-lg">SmartReal</span>
//         </Link>
//
//         <div className="flex items-center gap-6">
//           <Link href="/search" className="text-sm hover:text-primary transition-colors">
//             Browse Properties
//           </Link>
//           <Link href="/investor-portal" className="text-sm hover:text-primary transition-colors">
//             Investors
//           </Link>
//           <Link href="/contact" className="text-sm hover:text-primary transition-colors">
//             Contact
//           </Link>
//
//           <div className="flex gap-2">
//             <Link href="/login">
//               <Button variant="outline" size="sm">
//                 Sign In
//               </Button>
//             </Link>
//             <Link href="/signup">
//               <Button size="sm">List Property</Button>
//             </Link>
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }

// //////////////////////////// UPDATED BY CHAT GPT//////////////////
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Shape of server /api/auth/me response */
type MeResponse = {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
  };
};

/** runtime JWT payload shape (partial) */
type JwtPayload = {
  userId?: string;
  email?: string;
  role?: string;
  firstName?: string;
  iat?: number;
  exp?: number;
  [k: string]: any;
};

/** decode JWT payload safely; returns null on invalid or expired */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // base64 decode payload
    // atob might throw if invalid
    const payloadStr = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    // decode percent-encoded bytes (to support utf8)
    const json = JSON.parse(decodeURIComponent(escape(payloadStr)));
    // expiry check
    if (typeof json.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (json.exp <= now) return null;
    }
    return json as JwtPayload;
  } catch {
    return null;
  }
}

/** role options we support */
type Role = "user" | "agent" | "admin" | string | null;

export const Navigation = (): JSX.Element => {
  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, logout } = useAuth();

  const role = user?.role ?? null;
  const firstName = user?.firstName ?? null;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // compute role-specific link label & href
  const roleLink = useMemo(() => {
    if (!isAuthenticated) return { href: "/search", label: "Browse Properties" };
    if (role === "admin") return { href: "/admin", label: "Admin Panel" };
    if (role === "agent") return { href: "/agent/listings", label: "My Listings" };
    if (role === "investor") return { href: "/dashboard/investments", label: "My Investments" };
    return { href: "/dashboard", label: "Dashboard" };
  }, [isAuthenticated, role]);

  const isAdminArea = pathname?.startsWith("/admin") ?? false;

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-navbar backdrop-blur-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="SmartReal Logo"
            width={200}
            height={60}
            className="h-10 md:h-16 w-auto object-contain"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {!isAdminArea && (
            <>
              {isAuthenticated && firstName ? (
                <Link
                  href={role === "admin" ? "/admin" : "/dashboard"}
                  className={cn(
                    "text-sm transition-colors py-1 border-b-2 font-medium",
                    isActive(role === "admin" ? "/admin" : "/dashboard")
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-700 hover:text-primary"
                  )}
                >
                  Hi, {firstName}
                </Link>
              ) : (
                <Link
                  href={roleLink.href}
                  className={cn(
                    "text-sm transition-colors py-1 border-b-2 font-medium",
                    isActive(roleLink.href)
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-700 hover:text-primary"
                  )}
                >
                  {roleLink.label}
                </Link>
              )}

              {role !== "investor" && (
                <>
                  <Link
                    href="/investor-portal"
                    className={cn(
                      "text-sm transition-colors py-1 border-b-2 font-medium",
                      isActive("/investor-portal")
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-700 hover:text-primary"
                    )}
                  >
                    Investors
                  </Link>
                  <Link
                    href="/contact"
                    className={cn(
                      "text-sm transition-colors py-1 border-b-2 font-medium",
                      isActive("/contact")
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-700 hover:text-primary"
                    )}
                  >
                    Contact
                  </Link>
                </>
              )}
            </>
          )}

          <div className="flex gap-2">
            {isAuthenticated ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">List Property</Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-primary focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          {!isAdminArea && (
            <>
              {isAuthenticated && firstName ? (
                <Link
                  href={role === "admin" ? "/admin" : "/dashboard"}
                  className={cn(
                    "block text-base font-medium px-3 py-2 rounded-md transition-colors",
                    isActive(role === "admin" ? "/admin" : "/dashboard")
                      ? "bg-primary/10 text-primary"
                      : "text-gray-800 hover:text-primary hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Hi, {firstName}
                </Link>
              ) : (
                <Link
                  href={roleLink.href}
                  className={cn(
                    "block text-base font-medium px-3 py-2 rounded-md transition-colors",
                    isActive(roleLink.href)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-800 hover:text-primary hover:bg-gray-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {roleLink.label}
                </Link>
              )}

              {role !== "investor" && (
                <>
                  <Link
                    href="/investor-portal"
                    className={cn(
                      "block text-base font-medium px-3 py-2 rounded-md transition-colors",
                      isActive("/investor-portal")
                        ? "bg-primary/10 text-primary"
                        : "text-gray-800 hover:text-primary hover:bg-gray-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Investors
                  </Link>
                  <Link
                    href="/contact"
                    className={cn(
                      "block text-base font-medium px-3 py-2 rounded-md transition-colors",
                      isActive("/contact")
                        ? "bg-primary/10 text-primary"
                        : "text-gray-800 hover:text-primary hover:bg-gray-50"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </>
              )}
            </>
          )}

          <div className="pt-4 flex flex-col gap-2 border-t border-gray-100">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Logout
              </Button>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">List Property</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
