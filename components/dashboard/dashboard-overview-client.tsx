"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Home, Eye, Heart, DollarSign, TrendingUp } from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  activeListings: number
  totalViews: number
  totalFavorites: number
  estimatedRevenue: number
  monthlyListingTrend: number
  weeklyViewTrend: number
  monthlyFavoriteTrend: number
}

interface RecentActivity {
  _id: string
  type: string
  property: string
  count: number
  time: string
}

interface DashboardOverviewClientProps {
  stats: DashboardStats
  recentActivity: RecentActivity[]
  userRole?: string
}

export function DashboardOverviewClient({ stats, recentActivity, userRole }: DashboardOverviewClientProps) {
  
  const statsDisplay = [
    {
      label: "Active Listings",
      value: stats?.activeListings || 0,
      icon: Home,
      change: `+${stats?.monthlyListingTrend || 0} this month`,
      color: "text-blue-500",
    },
    {
      label: "Total Views",
      value: (stats?.totalViews || 0).toLocaleString(),
      icon: Eye,
      change: `+${(stats?.weeklyViewTrend || 0).toLocaleString()} this week`,
      color: "text-green-500",
    },
    {
      label: "Favorites",
      value: (stats?.totalFavorites || 0).toLocaleString(),
      icon: Heart,
      change: `+${stats?.monthlyFavoriteTrend || 0} this month`,
      color: "text-red-500",
    },
    {
      label: "Estimated Revenue",
      value: `₦${(stats?.estimatedRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      change: `From active listings`,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here&apos;s your real estate overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <Card key={stat.label} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-secondary ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3" />
              {stat.change}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>

            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity._id}
                  className="flex items-center justify-between pb-4 border-b border-border last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="font-semibold">{activity.property}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.type === "listing_viewed" && `${activity.count} views`}
                      {activity.type === "listing_favorited" && `${activity.count} new favorites`}
                      {activity.type === "inquiry" && `${activity.count} inquiries`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>

            <Link href="/dashboard/analytics">
              <Button className="w-full mt-6 bg-transparent" variant="outline">
                View Detailed Analytics
              </Button>
            </Link>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

              <div className="space-y-3">
                {userRole === "investor" ? (
                  <>
                    <Link href="/investor-portal">
                      <Button className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Find New Opportunity
                      </Button>
                    </Link>
                    <Link href="/dashboard/investments/manage">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        My Investment
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Heart className="h-4 w-4 mr-2" />
                      View Favorites
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/list-property">
                      <Button className="w-full justify-start">
                        <Home className="h-4 w-4 mr-2" />
                        List New Property
                      </Button>
                    </Link>
                    <Link href="/dashboard/listings">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <Home className="h-4 w-4 mr-2" />
                        Manage Listings
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Heart className="h-4 w-4 mr-2" />
                      View Favorites
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm font-semibold text-accent mb-2">Pro Tip</p>
              <p className="text-xs text-muted-foreground">
                Add high-quality photos to increase your property views by up to 300%.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
