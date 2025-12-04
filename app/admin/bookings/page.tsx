"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Calendar, Check, X, Clock, Loader2 } from "lucide-react"

import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { StatusModal } from "@/components/status-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Booking {
  _id: string
  name: string
  email: string
  phone: string
  propertyTitle: string
  date: string
  time: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: string
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    type: "success" | "error"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })

  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      fetchBookings()
    }
  }, [token])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch bookings")
      const data = await res.json()
      setBookings(data)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update booking")

      setBookings(bookings.map(b =>
        b._id === id ? { ...b, status: newStatus as any } : b
      ))

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Status Updated",
        message: `Booking marked as ${newStatus}`,
      })
    } catch (error) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Failed to update booking status",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "default" // primary
      case "pending": return "secondary" // gray/yellow-ish usually
      case "cancelled": return "destructive"
      case "completed": return "outline"
      default: return "secondary"
    }
  }

  const filteredBookings = bookings.filter(booking =>
    booking.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.propertyTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage property viewings and appointments</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking._id}>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-xs text-muted-foreground">{booking.email}</div>
                    </TableCell>
                    <TableCell>{booking.propertyTitle || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{booking.date}</span>
                        <span className="text-xs text-muted-foreground">{booking.time}</span>
                      </div>
                    </TableCell>
                    <TableCell>{booking.phone}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        defaultValue={booking.status}
                        onValueChange={(val: string) => handleStatusUpdate(booking._id, val)}
                      >
                        <SelectTrigger className="w-[130px] ml-auto">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  )
}
