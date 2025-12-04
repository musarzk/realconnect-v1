"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Calendar, FileText, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useContext } from "react"
import { LoadingCard } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/auth-context"

interface InvestmentDetail {
  _id: string
  propertyId: {
    _id: string
    title: string
    images: string[]
    location: string
  }
  amount: number
  investmentDate: string
  roi: number
  status: "active" | "completed" | "pending"
  returns: number
  paymentSchedule?: {
    month: string
    amount: number
    status: "paid" | "pending"
  }[]
  documents?: {
    name: string
    url: string
    type: string
  }[]
}

export default function ManageInvestmentPage() {
  const { user } = useContext(AuthContext) as any || null
  const [investments, setInvestments] = useState<InvestmentDetail[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentDetail | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchInvestmentDetails()
    }
  }, [user])

  const fetchInvestmentDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/investments?userId=${user?.id}`)
      if (!response.ok) throw new Error("Failed to fetch investments")
      
      const data = await response.json()
      setInvestments(data)
      
      if (data.length > 0) {
        setSelectedInvestment(data[0])
      }
    } catch (error) {
      console.error("Failed to fetch investment details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingCard />
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Manage Investment</h1>
          <p className="text-muted-foreground">View and manage your investment details</p>
        </div>
      </div>

      {investments.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Investment List Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-bold mb-4">Your Investments</h2>
              <div className="space-y-2">
                {investments.map((investment) => (
                  <div
                    key={investment._id}
                    onClick={() => setSelectedInvestment(investment)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedInvestment?._id === investment._id
                        ? "bg-blue-50 text-blue-900"
                        : "hover:bg-blue-50/50"
                    }`}
                  >
                    <p className="font-medium text-sm mb-1">{investment.propertyId.title}</p>
                    <p className="text-xs opacity-80">₦{investment.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Investment Details */}
          {selectedInvestment && (
            <div className="lg:col-span-2 space-y-6">
              {/* Property Info */}
              <Card className="p-6">
                <div className="flex gap-4">
                  <img
                    src={selectedInvestment.propertyId.images[0] || "/placeholder.svg"}
                    alt={selectedInvestment.propertyId.title}
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedInvestment.propertyId.title}</h2>
                    <p className="text-muted-foreground mb-4">{selectedInvestment.propertyId.location}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Investment Amount</p>
                        <p className="text-xl font-bold">₦{selectedInvestment.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Returns</p>
                        <p className="text-xl font-bold text-green-500">
                          +₦{selectedInvestment.returns.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ROI</p>
                        <p className="text-xl font-bold">{selectedInvestment.roi}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            selectedInvestment.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : selectedInvestment.status === "completed"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {selectedInvestment.status.charAt(0).toUpperCase() + selectedInvestment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Link href={`/property/${selectedInvestment.propertyId._id}`}>
                    <Button variant="outline" className="w-full">
                      View Full Property Details
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Payment Schedule */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Schedule
                </h3>
                {selectedInvestment.paymentSchedule && selectedInvestment.paymentSchedule.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInvestment.paymentSchedule.map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{payment.month}</p>
                          <p className="text-sm text-muted-foreground">₦{payment.amount.toLocaleString()}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          }`}
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No payment schedule available.</p>
                )}
              </Card>

              {/* Documents */}
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Investment Documents
                </h3>
                {selectedInvestment.documents && selectedInvestment.documents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedInvestment.documents.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={doc.url} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No documents available.</p>
                )}
              </Card>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You haven't made any investments yet</p>
            <Link href="/investor-portal">
              <Button>Explore Investment Opportunities</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
