"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LayoutDashboard, Home, BarChart3, User, LogOut, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"; // path you save it to
import { useAuth } from "@/hooks/use-auth"


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useLogout();
  const { user } = useAuth();

  // Dynamic sidebar items based on user role
  const getSidebarItems = () => {
    if (user?.role === "investor") {
      return [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Investments", href: "/dashboard/investments", icon: TrendingUp },
        { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { label: "Profile", href: "/dashboard/profile", icon: User },
      ];
    }

    // Default for agents and users
    return [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Listings", href: "/dashboard/listings", icon: Home },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ];
  };

  const SIDEBAR_ITEMS = getSidebarItems();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${sidebarOpen ? "w-64" : "w-0"
            } transition-all duration-300 bg-card shadow-md overflow-hidden sticky top-0 h-[calc(100vh-64px)]`}
        >
          <div className="p-6 space-y-4">
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === item.href ? "bg-blue-50 text-blue-900" : "text-foreground hover:bg-blue-50/50"
                    }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Link>
            ))}

            <div className="pt-4">
              <Button onClick={logout} variant="outline" className="w-full justify-start bg-transparent">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mb-4 p-2 hover:bg-secondary rounded-lg transition-colors md:hidden"
            >
              <LayoutDashboard className="h-6 w-6" />
            </button>
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
