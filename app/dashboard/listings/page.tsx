"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Heart, AlertCircle } from "lucide-react"
import Link from "next/link"
import { LoadingCard } from "@/components/loading-spinner"

interface Listing {
  _id: string
  title: string
  status: "approved" | "pending" | "rejected"
  price: number
  priceUsd?: number | null
  location: string
  type: string
  views: number
  favorites: number
  createdAt: string
}

interface PaginatedResponse {
  listings: Listing[]
  total: number
  page: number
  limit: number
  pages: number
}

export default function DashboardListings() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const pageSize = 10

  useEffect(() => {
    fetchListings()
  }, [page])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard/listings?page=${page}&limit=${pageSize}`, {
        cache: "no-store",
      })

      if (!res.ok) throw new Error("Failed to fetch listings")

      const data: PaginatedResponse = await res.json()
      setListings(data.listings)
      setTotal(data.total)
      setTotalPages(data.pages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingCard />
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-gray-600 mt-1">{total} properties listed</p>
        </div>
        <Link href="/list-property">
          <Button className="bg-blue-600 hover:bg-blue-700">Create New Listing</Button>
        </Link>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {listings.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600 mb-4">You haven't created any listings yet</p>
          <Link href="/list-property">
            <Button>Create Your First Listing</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing._id} className="p-6 flex items-start gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{listing.title}</h3>
                  <p className="text-gray-600">{listing.location}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span>₦{listing.price.toLocaleString()}</span>
                    {listing.priceUsd && <span>${listing.priceUsd.toLocaleString()}</span>}
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {listing.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-4 h-4" /> {listing.favorites} favorites
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      listing.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : listing.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}>
                      {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/property/${listing._id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2">Page {page} of {totalPages}</span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
