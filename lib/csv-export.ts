/**
 * CSV Export utilities for reports
 */

export interface CSVExportOptions {
  filename?: string
  headers?: string[]
  data: Record<string, any>[]
}

/**
 * Convert array of objects to CSV format
 */
export function arrayToCSV(data: Record<string, any>[], headers?: string[]): string {
  if (!data || data.length === 0) {
    return ""
  }

  // Use provided headers or infer from first object
  const cols = headers || Object.keys(data[0])

  // Build header row
  const headerRow = cols.map(escapeCSVField).join(",")

  // Build data rows
  const dataRows = data.map((row) => cols.map((col) => escapeCSVField(row[col])).join(","))

  return [headerRow, ...dataRows].join("\n")
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) return ""

  const str = String(field)
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

/**
 * Trigger download of CSV file
 */
export function downloadCSV(csvContent: string, filename: string = "export.csv"): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export properties to CSV
 */
export function exportPropertiesCSV(
  properties: Record<string, any>[],
  filename: string = `properties-report-${new Date().toISOString().split("T")[0]}.csv`
): void {
  const headers = ["ID", "Title", "Type", "Listing Type", "Location", "Price (NGN)", "Price (USD)", "Status", "Beds", "Baths", "Sqft", "Owner ID", "Views", "Favorites", "Created At"]

  const data = properties.map((p) => ({
    ID: p._id || "",
    Title: p.title || "",
    Type: p.type || "",
    "Listing Type": p.listingType || "",
    Location: p.location || "",
    "Price (NGN)": p.price || 0,
    "Price (USD)": p.priceUsd || "",
    Status: p.status || "",
    Beds: p.beds || 0,
    Baths: p.baths || 0,
    Sqft: p.sqft || 0,
    "Owner ID": p.ownerId || "",
    Views: p.views || 0,
    Favorites: p.favorites || 0,
    "Created At": p.createdAt || "",
  }))

  const csv = arrayToCSV(data, headers)
  downloadCSV(csv, filename)
}

/**
 * Export bookings to CSV
 */
export function exportBookingsCSV(
  bookings: Record<string, any>[],
  filename: string = `bookings-report-${new Date().toISOString().split("T")[0]}.csv`
): void {
  const headers = ["ID", "Property ID", "User ID", "Check-In Date", "Check-Out Date", "Total Price", "Status", "Created At"]

  const data = bookings.map((b) => ({
    ID: b._id || "",
    "Property ID": b.propertyId || "",
    "User ID": b.userId || "",
    "Check-In Date": b.checkInDate || "",
    "Check-Out Date": b.checkOutDate || "",
    "Total Price": b.totalPrice || 0,
    Status: b.status || "",
    "Created At": b.createdAt || "",
  }))

  const csv = arrayToCSV(data, headers)
  downloadCSV(csv, filename)
}

/**
 * Export summary report to CSV
 */
export function exportSummaryCSV(
  summary: Record<string, any>,
  filename: string = `summary-report-${new Date().toISOString().split("T")[0]}.csv`
): void {
  const data = [
    { Metric: "Total Properties", Value: summary.totalProperties || 0 },
    { Metric: "Approved Properties", Value: summary.totalApproved || 0 },
    { Metric: "Pending Properties", Value: summary.totalPending || 0 },
    { Metric: "Rejected Properties", Value: summary.totalRejected || 0 },
    { Metric: "Total Revenue (NGN)", Value: `₦${(summary.totalRevenue || 0).toLocaleString()}` },
    { Metric: "Average Property Price (NGN)", Value: `₦${(summary.avgPrice || 0).toLocaleString()}` },
    { Metric: "Total Users", Value: summary.totalUsers || 0 },
    { Metric: "Total Bookings", Value: summary.totalBookings || 0 },
  ]

  const csv = arrayToCSV(data, ["Metric", "Value"])
  downloadCSV(csv, filename)
}

/**
 * Export all data combined (summary + properties + bookings)
 */
export function exportFullReport(reportData: any): void {
  const timestamp = new Date().toISOString().split("T")[0]

  // Export summary
  exportSummaryCSV(reportData.summary, `01-summary-${timestamp}.csv`)

  // Export properties
  exportPropertiesCSV(reportData.properties || [], `02-properties-${timestamp}.csv`)

  // Export bookings
  if (reportData.bookings && reportData.bookings.length > 0) {
    exportBookingsCSV(reportData.bookings, `03-bookings-${timestamp}.csv`)
  }
}
