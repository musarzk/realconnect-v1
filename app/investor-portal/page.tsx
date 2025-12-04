"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { TrendingUp, Target, PieChart, DollarSign, MapPin, Filter, Plus } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { LoadingSpinner } from "@/components/loading-spinner"
import { StatusModal } from "@/components/status-modal"

interface InvestmentProperty {
  id: number
  title: string
  location: string
  price: number
  expectedROI: number
  riskLevel: "low" | "medium" | "high"
  minInvestment: number
  investors: number
  yearsToBreakeven: number
  image: string
  verified: boolean
}

export default function InvestorPortal() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedRisk, setSelectedRisk] = useState<string>("all")
  const [minBudget, setMinBudget] = useState<string>("")
  const [investments, setInvestments] = useState<InvestmentProperty[]>([])
  const [loading, setLoading] = useState(true)

  // Status Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    type: "success" | "error" | "info"
    title: string
    message: string
    actionLabel?: string
    onAction?: () => void
  }>({
    type: "info",
    title: "",
    message: "",
  })

  useEffect(() => {
    loadInvestmentOpportunities()
  }, [])

  const loadInvestmentOpportunities = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/investor-properties", { cache: "no-store" })

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()
      setInvestments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to load investments:", error)
      setInvestments([])
    } finally {
      setLoading(false)
    }
  }

  const filteredInvestments = investments.filter((inv) => {
    const matchesRisk = selectedRisk === "all" || inv.riskLevel === selectedRisk
    const matchesBudget = !minBudget || inv.minInvestment <= Number.parseInt(minBudget)
    return matchesRisk && matchesBudget
  })

  const totalOpportunities = investments.reduce((sum, inv) => sum + inv.price, 0)
  const averageROI = investments.length > 0
    ? investments.reduce((sum, inv) => sum + inv.expectedROI, 0) / investments.length
    : 0
  const totalInvestors = investments.reduce((sum, inv) => sum + (inv.investors || 0), 0)

  const stats = [
    {
      icon: DollarSign,
      label: "Total Opportunities",
      value: totalOpportunities > 0 ? `$${(totalOpportunities / 1000000).toFixed(1)}M` : "$0",
      change: "+12%",
    },
    {
      icon: TrendingUp,
      label: "Average ROI",
      value: `${averageROI.toFixed(1)}%`,
      change: "+2.3%",
    },
    {
      icon: Target,
      label: "Active Investors",
      value: `${totalInvestors.toLocaleString()}`,
      change: "+15%",
    },
    {
      icon: PieChart,
      label: "Available Properties",
      value: investments.length.toString(),
      change: `${filteredInvestments.length} filtered`,
    },
  ]

  const riskLevels = [
    { value: "all", label: "All Risk Levels" },
    { value: "low", label: "Low Risk" },
    { value: "medium", label: "Medium Risk" },
    { value: "high", label: "High Risk" },
  ]

  const handleInvestClick = (opportunity: InvestmentProperty) => {
    if (!user) {
      setModalConfig({
        type: "info",
        title: "Account Required",
        message: "You need to create an account to start investing. Join us today to access exclusive opportunities.",
        actionLabel: "Create Account",
        onAction: () => router.push("/signup"),
      })
      setModalOpen(true)
      return
    }

    // Check if user is approved
    if (!(user as any).approved) {
      setModalConfig({
        type: "info",
        title: "Account Pending Approval",
        message: "Your account is currently pending admin approval. You will be able to invest once your account is verified.",
        actionLabel: "Close",
        onAction: () => setModalOpen(false),
      })
      setModalOpen(true)
      return
    }

    const params = new URLSearchParams({
      propertyId: opportunity.id.toString(),
      title: opportunity.title,
      price: opportunity.price.toString(),
      roi: opportunity.expectedROI.toString(),
    })
    router.push(`/create-portfolio?${params.toString()}`)
  }

  const handleCreatePortfolio = () => {
    if (!user) {
      setModalConfig({
        type: "info",
        title: "Account Required",
        message: "You need to create an account to create a portfolio. Join us today to start your investment journey.",
        actionLabel: "Create Account",
        onAction: () => router.push("/signup"),
      })
      setModalOpen(true)
      return
    }

    // Check if user is approved
    if (!(user as any).approved) {
      setModalConfig({
        type: "info",
        title: "Account Pending Approval",
        message: "Your account is currently pending admin approval. You will be able to create a portfolio once your account is verified.",
        actionLabel: "Close",
        onAction: () => setModalOpen(false),
      })
      setModalOpen(true)
      return
    }

    router.push("/create-portfolio")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">Investor Portal</h1>
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
            Access verified real estate investment opportunities with transparent returns and risk profiles
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow border-border/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-foreground/70 text-sm mb-2 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-primary opacity-80" />
                </div>
                <p className="text-xs text-green-600 mt-4 font-medium">{stat.change} this month</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-card border-y border-border/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Filter className="h-5 w-5 text-foreground/60" />
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
              >
                {riskLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Min Investment Budget"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRisk("all")
                  setMinBudget("")
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground">Investment Opportunities</h2>
              <p className="text-foreground/70 mt-2">
                {filteredInvestments.length} opportunities matching your criteria
              </p>
            </div>
            <Button onClick={handleCreatePortfolio}>
              <Plus className="mr-2 h-4 w-4" />
              Create Portfolio
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {/* Properties Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInvestments.map((opportunity) => (
                <Card key={opportunity.id} className="p-0 overflow-hidden hover:shadow-lg transition-shadow border-border/50">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    <img
                      src={opportunity.image || "/placeholder.svg"}
                      alt={opportunity.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-[#33CC33] text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
                      {opportunity.expectedROI}% ROI
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <h3 className="text-xl font-bold mb-2 text-foreground">{opportunity.title}</h3>
                    <div className="flex items-center gap-2 text-foreground/70 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-border">
                      <div>
                        <p className="text-foreground/70 text-sm font-medium">Total Investment</p>
                        <p className="font-bold text-foreground">${(opportunity.price / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-foreground/70 text-sm font-medium">Min. Investment</p>
                        <p className="font-bold text-foreground">${(opportunity.minInvestment / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-foreground/70 text-sm font-medium">Risk Level</p>
                        <p className="font-bold capitalize text-primary">{opportunity.riskLevel}</p>
                      </div>
                      <div>
                        <p className="text-foreground/70 text-sm font-medium">Breakeven</p>
                        <p className="font-bold text-foreground">{opportunity.yearsToBreakeven} years</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-foreground/70 font-medium">{opportunity.investors} investors</span>
                      {opportunity.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">✓ Verified</span>
                      )}
                    </div>

                    <Button
                      className="w-full"
                      onClick={() => handleInvestClick(opportunity)}
                    >
                      Invest Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredInvestments.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-foreground/70">No investment opportunities match your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedRisk("all")
                  setMinBudget("")
                }}
              >
                Reset Filters
              </Button>
            </Card>
          )}
        </div>
      </section>

      <Footer />

      <StatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        actionLabel={modalConfig.actionLabel}
        onAction={modalConfig.onAction}
      />
    </div>
  )
}
