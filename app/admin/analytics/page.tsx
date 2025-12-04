"use client"

import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useState, useEffect } from "react"
import { LoadingCard } from "@/components/loading-spinner"

interface DailyData {
  day: string
  users: number
  properties: number
  transactions: number
}

export default function AdminAnalytics() {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
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

      // Fetch daily analytics data
      const dailyRes = await fetch("/api/admin/analytics/daily", { cache: "no-store" })
      if (!dailyRes.ok) {
        if (dailyRes.status === 401) {
          setError("Unauthorized — please sign in as an admin to view analytics.")
          setDailyData([])
          setMetrics([])
          return
        }
        console.warn("/api/admin/analytics/daily returned non-ok", dailyRes.status)
        setDailyData([])
      } else {
        const daily = await dailyRes.json()
        setDailyData(daily.length > 0 ? daily : [])
      }
      setMetrics([
        { label: "Avg. Session Duration", value: "4m 32s", change: "+12s" },
        { label: "Bounce Rate", value: "24.5%", change: "-2.3%" },
        { label: "Conversion Rate", value: "3.8%", change: "+0.5%" },
        { label: "Avg. Pages/Session", value: "5.2", change: "+0.8" },
      ])
    } catch (err: any) {
      console.warn("Failed to fetch analytics:", err?.message ?? err)
      setError(err?.message ?? "Failed to load analytics")
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
        <h1 className="text-3xl font-bold mb-2">Advanced Analytics</h1>
        <p className="text-muted-foreground">Detailed platform performance metrics</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-4">
            <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
            <p className="text-2xl font-bold mb-1">{metric.value}</p>
            <p className="text-xs text-green-600">{metric.change}</p>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Daily Activity</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="users" fill="#3b82f6" fillOpacity={0.6} stroke="#3b82f6" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Transactions */}
        <Card className="p-6">
          <h2 className="font-bold mb-4">Weekly Transactions</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Multi-line Chart */}
      <Card className="p-6">
        <h2 className="font-bold mb-4">Platform Metrics Overview</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
            <Line yAxisId="left" type="monotone" dataKey="properties" stroke="#8b5cf6" strokeWidth={2} />
            <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
