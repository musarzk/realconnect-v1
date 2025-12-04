"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Home,
  Bath,
  Maximize2,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isBookingSubmitted, setIsBookingSubmitted] = useState(false)
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  })

  const property = {
    id: id,
    title: "Modern Luxury Apartment with City Views",
    price: 850000,
    priceUsd: 5000, // Optional USD equivalent
    location: "Downtown Manhattan, New York",
    beds: 3,
    baths: 2,
    sqft: 2500,
    yearBuilt: 2021,
    propertyType: "Apartment",
    images: [
      "/luxury-apartment-living-room.png",
      "/modern-apartment-bedroom.png",
      "/apartment-kitchen-dining.jpg",
      "/apartment-bathroom.png",
    ],
    description:
      "Stunning modern apartment in the heart of downtown with breathtaking city views. Features include high-end appliances, smart home automation, heated floors, and access to premium building amenities.",
    amenities: ["Smart Home", "Gym", "Pool", "Concierge", "Security", "Parking"],
    priceHistory: [
      { month: "Jan", price: 820000 },
      { month: "Feb", price: 825000 },
      { month: "Mar", price: 835000 },
      { month: "Apr", price: 845000 },
      { month: "May", price: 850000 },
    ],
    aiAnalysis: {
      marketTrend: "Strong Upward",
      roiPotential: "12.5% Annual ROI",
      valuationGrade: "A+",
      pricePerSqft: "$340",
    },
    agent: {
      name: "Sarah Johnson",
      phone: "+1 (555) 123-4567",
      email: "sarah@smartreal.com",
      image: "/professional-agent-portrait.png",
    },
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
  }

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.date || !bookingData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to schedule a visit.",
        variant: "destructive",
      })
      return
    }

    setIsBookingSubmitted(true)
    toast({
      title: "Visit Scheduled!",
      description: `Your tour has been scheduled for ${bookingData.date} at ${bookingData.time}. The agent will confirm shortly.`,
    })

    setTimeout(() => {
      setBookingData({ name: "", email: "", phone: "", date: "", time: "" })
      setIsBookingSubmitted(false)
    }, 3000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title} - ${property.location}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Share cancelled or failed")
      }
    } else {
      toast({
        title: "Link Copied",
        description: "Property link copied to clipboard",
      })
    }
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited)
    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorited
        ? "This property has been removed from your favorites."
        : "This property has been added to your favorites.",
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Image Gallery */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden bg-muted h-96">
            <img
              src={property.images[currentImageIndex] || "/placeholder.svg"}
              alt={property.title}
              className="w-full h-full object-cover"
            />

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
              {currentImageIndex + 1} / {property.images.length}
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
              {property.images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`rounded-lg overflow-hidden border-2 transition-colors ${
                  index === currentImageIndex ? "border-primary" : "border-border"
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <img src={image || "/placeholder.svg"} alt={`View ${index + 1}`} className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.location}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleFavorite}
                  className={isFavorited ? "bg-accent text-accent-foreground" : ""}
                  aria-label="Add to favorites"
                >
                  <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share property">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <div className="border-b border-border pb-6">
              <p className="text-5xl font-bold text-primary mb-2">₦{property.price.toLocaleString()}</p>
              <p className="text-muted-foreground">
                ₦{(property.price / property.sqft).toLocaleString(undefined, { maximumFractionDigits: 0 })} per sq ft
              </p>
              {property.priceUsd && (
                <p className="text-sm text-muted-foreground mt-2">(USD ${Number(property.priceUsd).toLocaleString()})</p>
              )}
            </div>

            {/* Key Features */}
            <Card className="p-6 bg-secondary/20">
              <h2 className="font-bold mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Bedrooms</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Home className="h-5 w-5 text-primary" />
                    {property.beds}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Bathrooms</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Bath className="h-5 w-5 text-primary" />
                    {property.baths}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Square Feet</p>
                  <p className="text-2xl font-bold flex items-center gap-2">
                    <Maximize2 className="h-5 w-5 text-primary" />
                    {property.sqft.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Year Built</p>
                  <p className="text-2xl font-bold">{property.yearBuilt}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Type</p>
                  <p className="text-lg font-semibold">{property.propertyType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-1">Price/Sqft</p>
                  <p className="text-lg font-semibold text-primary">{property.aiAnalysis.pricePerSqft}</p>
                </div>
              </div>
            </Card>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About This Property</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">{property.description}</p>

              <h3 className="font-bold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 p-3 bg-secondary/30 rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <h2 className="font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                AI Market Analysis
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Market Trend</p>
                  <p className="font-bold text-primary">{property.aiAnalysis.marketTrend}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">ROI Potential</p>
                  <p className="font-bold text-accent">{property.aiAnalysis.roiPotential}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Valuation Grade</p>
                  <p className="font-bold text-lg">{property.aiAnalysis.valuationGrade}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Trend</p>
                  <p className="text-sm">Growing demand</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Agent Card */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Contact Agent</h3>
              <div className="text-center mb-6">
                <img
                  src={property.agent.image || "/placeholder.svg"}
                  alt={property.agent.name}
                  className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                />
                <p className="font-semibold">{property.agent.name}</p>
                <p className="text-sm text-muted-foreground">Real Estate Specialist</p>
              </div>

              <div className="space-y-3 mb-6">
                <Button className="w-full" size="sm">
                  Call Agent
                </Button>
                <Button variant="outline" className="w-full bg-transparent" size="sm">
                  Send Message
                </Button>
              </div>

              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Phone:</span> {property.agent.phone}
                </p>
                <p className="text-sm text-muted-foreground break-all">
                  <span className="font-semibold">Email:</span> {property.agent.email}
                </p>
              </div>
            </Card>

            {/* Schedule Visit */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              {isBookingSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <CheckCircle className="h-12 w-12 text-primary mb-3" />
                  <h3 className="font-bold text-center mb-1">Visit Scheduled!</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Check your email for confirmation details.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-bold mb-4">Schedule a Visit</h3>

                  <form onSubmit={handleBookingSubmit} className="space-y-3">
                    <Input
                      type="text"
                      placeholder="Full Name"
                      value={bookingData.name}
                      onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                    />
                    <Input
                      type="tel"
                      placeholder="Phone"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Input
                        type="date"
                        className="flex-1"
                        value={bookingData.date}
                        onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      />
                      <Input
                        type="time"
                        className="flex-1"
                        value={bookingData.time}
                        onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Visit
                    </Button>
                  </form>
                </>
              )}
            </Card>

            {/* Report Listing */}
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={() =>
                toast({
                  title: "Report Submitted",
                  description: "Thank you for reporting. We'll review this listing.",
                })
              }
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Report This Listing
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
