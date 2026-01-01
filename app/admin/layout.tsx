"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { BarChart3, Home, Users, FileText, Settings, LogOut, Activity, Calendar, MessageSquare, TrendingUp, Briefcase, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useLogout"
import { Breadcrumbs } from "@/components/breadcrumbs"


const ADMIN_MENU_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: Activity },
  { label: "List Property", href: "/list-property", icon: Home }, // User specifically asked for this
  { label: "Properties", href: "/admin/properties", icon: FileText }, // Changed icon to differentiate
  { label: "Bookings", href: "/admin/bookings", icon: Calendar },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Investments", href: "/admin/investments", icon: TrendingUp },
  { label: "Investors", href: "/admin/investors", icon: Briefcase },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Analytics", href: "/admin/analytics", icon: Settings },
  { label: "View Site", href: "/", icon: Home },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useLogout();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Admin Sidebar */}
        <div
          className={`${sidebarOpen ? "w-48" : "w-14"
            } transition-all duration-300 bg-card shadow-md flex flex-col flex-shrink-0 h-[calc(100vh-64px)] sticky top-0`}
        >
          <div className="p-4 flex items-center justify-between">
            {sidebarOpen && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                Admin Panel
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-auto h-8 w-8 p-0"
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-light py-4 px-3 space-y-2">
            {ADMIN_MENU_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative ${pathname === item.href
                    ? "bg-blue-50 text-blue-900"
                    : "text-foreground hover:bg-blue-50/50"
                    } ${!sidebarOpen ? "justify-center" : ""}`}
                  title={!sidebarOpen ? item.label : ""}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
                </div>
              </Link>
            ))}
          </div>

          <div className="p-4">
            <Button
              onClick={logout}
              variant="outline"
              className={`w-full bg-transparent ${!sidebarOpen ? "px-0 justify-center" : "justify-start"}`}
              title={!sidebarOpen ? "Sign Out" : ""}
            >
              <LogOut className={`h-4 w-4 ${sidebarOpen ? "mr-2" : ""}`} />
              {sidebarOpen && "Sign Out"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-background p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto">
            <Breadcrumbs />
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
