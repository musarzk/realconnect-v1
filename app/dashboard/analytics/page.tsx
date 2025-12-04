"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useState, useEffect } from "react"
import { LoadingCard } from "@/components/loading-spinner"

interface ViewsData {
  month: string
  views: number
  favorites: number
}

interface InquiriesData {
  name: string
  value: number
  fill: string
}

interface ConversionData {
  month: string
  conversion: number
}

export default function Analytics() {
  const [viewsData, setViewsData] = useState<ViewsData[]>([])
  const [inquiriesData, setInquiriesData] = useState<InquiriesData[]>([])
  const [conversionData, setConversionData] = useState<ConversionData[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch views data
      const viewsRes = await fetch("/api/dashboard/analytics/views", { cache: "no-store" })
      const views = viewsRes.ok ? await viewsRes.json() : []

      // Fetch inquiries data
      const inquiriesRes = await fetch("/api/dashboard/analytics/inquiries", { cache: "no-store" })
      const inquiries = inquiriesRes.ok ? await inquiriesRes.json() : []

      // Fetch conversion data
      const conversionRes = await fetch("/api/dashboard/analytics/conversion", { cache: "no-store" })
      const conversion = conversionRes.ok ? await conversionRes.json() : []

      setViewsData(
        views.length > 0
          ? views
          : [
              { month: "Jan", views: 240, favorites: 24 },
              { month: "Feb", views: 421, favorites: 42 },
              { month: "Mar", views: 356, favorites: 35 },
              { month: "Apr", views: 512, favorites: 51 },
              { month: "May", views: 678, favorites: 68 },
              { month: "Jun", views: 845, favorites: 84 },
            ]
      )

      setInquiriesData(
        inquiries.length > 0
          ? inquiries
          : [
              { name: "Serious Inquiries", value: 45, fill: "#3b82f6" },
              { name: "General Inquiries", value: 32, fill: "#8b5cf6" },
              { name: "Tour Requests", value: 28, fill: "#ec4899" },
            ]
      )

      setConversionData(
        conversion.length > 0
          ? conversion
          : [
              { month: "Jan", conversion: 2.4 },
              { month: "Feb", conversion: 3.2 },
              { month: "Mar", conversion: 2.8 },
              { month: "Apr", conversion: 4.1 },
              { month: "May", conversion: 5.2 },
              { month: "Jun", conversion: 6.8 },
            ]
      )

      setMetrics([
        { label: "Total Views", value: "3,852", change: "+12%" },
        { label: "Total Favorites", value: "412", change: "+8%" },
        { label: "Avg. Response Time", value: "2.3h", change: "-0.5h" },
        { label: "Conversion Rate", value: "6.8%", change: "+1.2%" },
      ])
    } catch (err: any) {
      console.error("Failed to fetch analytics:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingCard />
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-muted-foreground">Track your property performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-xs text-green-600">{metric.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views and Favorites Trend */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Views & Favorites Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="favorites" stroke="#ec4899" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Inquiries Distribution */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Inquiries Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={inquiriesData} cx="50%" cy="50%" labelLine={false} label outerRadius={100} dataKey="value">
                {inquiriesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Conversion Rate */}
      <Card className="p-6">
        <h2 className="font-bold mb-4">Conversion Rate Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={conversionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="conversion" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
