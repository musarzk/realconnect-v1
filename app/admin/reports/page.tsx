"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Download, Filter, AlertCircle } from "lucide-react"
import { exportPropertiesCSV, exportBookingsCSV, exportSummaryCSV, exportFullReport } from "@/lib/csv-export"
import { LoadingCard } from "@/components/loading-spinner"

interface ReportData {
  summary: {
    totalProperties: number
    totalApproved: number
    totalPending: number
    totalRejected: number
    totalRevenue: number
    avgPrice: number
    totalUsers: number
    totalBookings: number
  }
  breakdown: {
    byStatus: any[]
    byType: any[]
    byListingType: any[]
    topAgents: any[]
  }
  revenueTimeline: any[]
  properties: any[]
  bookings: any[]
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export default function AdminReports() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async (params?: any) => {
    try {
      setLoading(true)
      setError(null)

      const queryParams = new URLSearchParams()
      if (params?.startDate) queryParams.append("startDate", params.startDate)
      if (params?.endDate) queryParams.append("endDate", params.endDate)
      if (params?.status) queryParams.append("status", params.status)

      const res = await fetch(`/api/admin/reports?${queryParams.toString()}`, {
        cache: "no-store",
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }))
        const errorMsg = errorData?.error || errorData?.details || errorData?.detail || `HTTP ${res.status}`
        console.error("Reports API error:", { status: res.status, errorMsg, errorData })
        throw new Error(errorMsg)
      }

      const data = await res.json()
      setReportData(data)
    } catch (err: any) {
      console.error("Error fetching reports:", err)
      const errorMsg = err.message || "Failed to fetch reports"
      console.error("Setting error:", errorMsg)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    fetchReports(filters)
  }

  const clearFilters = () => {
    setFilters({ startDate: "", endDate: "", status: "" })
    fetchReports()
  }

  if (loading && !reportData) {
    return <LoadingCard />
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  const data = reportData || {
    summary: { totalProperties: 0, totalApproved: 0, totalPending: 0, totalRejected: 0, totalRevenue: 0, avgPrice: 0, totalUsers: 0, totalBookings: 0 },
    breakdown: { byStatus: [], byType: [], byListingType: [], topAgents: [] },
    revenueTimeline: [],
    properties: [],
    bookings: [],
  }

  const statusBreakdown = data.breakdown.byStatus || [
    { _id: "approved", count: 0, avgPrice: 0 },
    { _id: "pending", count: 0, avgPrice: 0 },
    { _id: "rejected", count: 0, avgPrice: 0 },
  ]

  const typeBreakdown = data.breakdown.byType || []
  const listingTypeBreakdown = data.breakdown.byListingType || []

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive platform analytics and data export</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => exportFullReport(data)} className="bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-md">
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="text-gray-600 text-sm">Total Properties</div>
          <div className="text-2xl font-bold mt-2 truncate" title={String(data.summary.totalProperties)}>{data.summary.totalProperties}</div>
          <div className="text-xs text-gray-500 mt-2">{data.summary.totalApproved} approved</div>
        </Card>
        <Card className="p-6">
          <div className="text-gray-600 text-sm">Pending Approval</div>
          <div className="text-2xl font-bold text-yellow-600 mt-2 truncate" title={String(data.summary.totalPending)}>{data.summary.totalPending}</div>
          <div className="text-xs text-gray-500 mt-2">{Math.round((data.summary.totalPending / data.summary.totalProperties) * 100) || 0}% of total</div>
        </Card>
        <Card className="p-6">
          <div className="text-gray-600 text-sm">Total Revenue</div>
          <div className="text-2xl font-bold mt-2 truncate" title={`₦${(data.summary.totalRevenue || 0).toLocaleString()}`}>₦{(data.summary.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-2">From 5% commission</div>
        </Card>
        <Card className="p-6">
          <div className="text-gray-600 text-sm">Avg Property Price</div>
          <div className="text-2xl font-bold mt-2 truncate" title={`₦${(data.summary.avgPrice || 0).toLocaleString()}`}>₦{(data.summary.avgPrice || 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-2">Across all listings</div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Properties by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {statusBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}`, "Count"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {statusBreakdown.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between">
                <span className="capitalize">{item._id}:</span>
                <span className="font-medium">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Property Type Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Properties by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Listing Type Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Listing Type Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={listingTypeBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgPrice" fill="#10b981" name="Avg Price (₦)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue Timeline */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueTimeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value: any) => `₦${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="revenue" stroke="#f59e0b" name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Agents */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Top Agents</h3>
          <Button onClick={() => exportPropertiesCSV(data.properties)} variant="outline" size="sm">
            <Download className="w-3 h-3 mr-2" />
            Export Properties
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold">Agent ID</th>
                <th className="text-right py-3 px-4 font-semibold">Properties</th>
                <th className="text-right py-3 px-4 font-semibold">Avg Price (₦)</th>
                <th className="text-right py-3 px-4 font-semibold">Total Value (₦)</th>
              </tr>
            </thead>
            <tbody>
              {(data.breakdown.topAgents || []).slice(0, 10).map((agent: any, idx: number) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">{agent._id}</td>
                  <td className="text-right py-3 px-4">{agent.propertyCount}</td>
                  <td className="text-right py-3 px-4">₦{(agent.avgPrice || 0).toLocaleString()}</td>
                  <td className="text-right py-3 px-4 font-semibold">₦{(agent.totalValue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export Buttons */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4">Export Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={() => exportSummaryCSV(data.summary)} variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
          <Button onClick={() => exportPropertiesCSV(data.properties)} variant="outline" className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            Export Properties
          </Button>
          {data.bookings && data.bookings.length > 0 && (
            <Button onClick={() => exportBookingsCSV(data.bookings)} variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Bookings
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
