"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  MessageSquare,
  Phone,
  X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { StatusModal } from "@/components/status-modal";
import { generateAIAnalysis } from "@/lib/ai-analysis";

interface PropertyData {
  _id?: string;
  id?: string;
  title?: string;
  price?: number;
  priceUsd?: number | null;
  location?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  yearBuilt?: number;
  propertyType?: string;
  images?: string[];
  description?: string;
  amenities?: string[];
  contact?: { name?: string; phone?: string; email?: string };
  type?: string;
  listingType?: string;
  agent?: { name?: string; phone?: string; email?: string; image?: string };
  aiAnalysis?: any;
  ownerId?: string;
  [key: string]: any;
}

type Props = {
  initialProperty?: PropertyData | null;
  propertyId?: string;
  children?: React.ReactNode;
};

export default function PropertyDetailClient({
  initialProperty,
  propertyId,
}: Props): JSX.Element {
  const { toast } = useToast();
  const { token, isAuthenticated } = useAuth();
  const [property, setProperty] = useState<PropertyData | null>(initialProperty ?? null);
  const [loading, setLoading] = useState<boolean>(!initialProperty);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  // Booking state
  const [isBookingSubmitted, setIsBookingSubmitted] = useState<boolean>(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });

  // Message state
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: "",
    content: "",
  });
  
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Client-side fetch fallback if initialProperty not provided
  useEffect(() => {
    if (property || !propertyId) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/properties/${propertyId}`, { cache: "no-store" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`API error ${res.status}: ${txt}`);
        }
        const json = await res.json();
        if (!mounted) return;
        setProperty(json);
      } catch (err: any) {
        console.error("Client fetch property failed:", err);
        if (!mounted) return;
        setError(err?.message || "Failed to load property");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [property, propertyId]);

  // Generate AI analysis if missing
  useEffect(() => {
    if (property && !property.aiAnalysis) {
      const analysis = generateAIAnalysis({
        price: property.price || 0,
        priceUsd: property.priceUsd,
        location: property.location || "",
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        yearBuilt: property.yearBuilt,
        type: property.type,
        listingType: property.listingType,
        propertyType: property.propertyType,
        amenities: property.amenities,
      });
      setProperty({ ...property, aiAnalysis: analysis });
    }
  }, [property]);

  // Carousel helpers
  const nextImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % property.images!.length);
  };
  const prevImage = () => {
    if (!property?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + property.images!.length) % property.images!.length);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to schedule a visit.",
        variant: "destructive",
      });
      return;
    }

    if (!bookingData.name || !bookingData.email || !bookingData.phone || !bookingData.date || !bookingData.time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to schedule a visit.",
        variant: "destructive",
      });
      return;
    }

    try {
      setBookingLoading(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property?._id || property?.id,
          propertyTitle: property?.title,
          ...bookingData,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit booking");
      }

      setIsBookingSubmitted(true);
      setIsBookingSubmitted(true);
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Visit Scheduled!",
        message: `Your tour has been scheduled for ${bookingData.date} at ${bookingData.time}. The agent will confirm shortly.`,
      });

      setTimeout(() => {
        setBookingData({ name: "", email: "", phone: "", date: "", time: "" });
        setIsBookingSubmitted(false);
      }, 3000);
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Booking Failed",
        message: "Could not schedule visit. Please try again.",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send a message.",
        variant: "destructive",
      });
      return;
    }

    if (!messageData.subject || !messageData.content) {
      toast({
        title: "Missing Information",
        description: "Please provide a subject and message content.",
        variant: "destructive",
      });
      return;
    }

    try {
      setMessageLoading(true);
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: property?._id || property?.id,
          propertyTitle: property?.title,
          recipientId: property?.ownerId,
          subject: messageData.subject,
          content: messageData.content,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Message Sent",
        message: "Your message has been sent to the agent.",
      });
      setMessageModalOpen(false);
      setMessageData({ subject: "", content: "" });
    } catch (err) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Message Failed",
        message: "Could not send message. Please try again.",
      });
    } finally {
      setMessageLoading(false);
    }
  };

  const handleShare = async () => {
    if (!property) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title} - ${property.location}`,
          url: window.location.href,
        });
      } catch {
        /* ignore */
      }
    } else {
      navigator.clipboard?.writeText(window.location.href).then(
        () =>
          toast({
            title: "Link Copied",
            description: "Property link copied to clipboard",
          }),
        () => {
          toast({
            title: "Copy failed",
            description: "Could not copy link to clipboard",
            variant: "destructive",
          });
        }
      );
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from Favorites" : "Added to Favorites",
      description: isFavorited ? "This property has been removed from your favorites." : "This property has been added to your favorites.",
    });
  };

  const handleCallAgent = () => {
    const phoneNumber = property?.agent?.phone || property?.contact?.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast({
        title: "No Phone Number",
        description: "Agent phone number is not available.",
        variant: "destructive",
      });
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-background relative">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="flex items-center justify-center min-h-48">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <Card className="p-8 border-red-200 bg-red-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Failed to Load Property</h3>
                <p className="text-red-800 text-sm mt-1">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        )}

        {property && (
          <>
            {/* Image Gallery */}
            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden bg-muted h-96">
                <img
                  src={property.images?.[currentImageIndex] || "/placeholder.svg"}
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
                  {currentImageIndex + 1} / {(property.images?.length) || 0}
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
                  {(property.images || []).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4">
                {(property.images || []).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${index === currentImageIndex ? "border-primary" : "border-border"}`}
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
                    <Button variant="outline" size="icon" onClick={handleFavorite} className={isFavorited ? "bg-accent text-accent-foreground" : ""} aria-label="Add to favorites">
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="icon" onClick={handleShare} aria-label="Share property">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="border-b border-border pb-6">
                  <p className="text-5xl font-bold text-primary mb-2">
                    {(property.price ?? 0) >= 1000000000 
                      ? `₦${((property.price ?? 0) / 1000000000).toFixed(1)}B`
                      : `₦${(property.price ?? 0).toLocaleString()}`
                    }
                  </p>
                  {property.sqft && property.sqft > 0 && (
                    <p className="text-muted-foreground">
                      ₦{((property.price ?? 0) / (property.sqft ?? 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })} per sq ft
                    </p>
                  )}
                  {property.priceUsd && <p className="text-sm text-muted-foreground mt-2">(USD ${Number(property.priceUsd).toLocaleString()})</p>}
                </div>

                {/* Key Features */}
                <Card className="p-6 bg-secondary/20">
                  <h2 className="font-bold mb-4">Property Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Bedrooms</p>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        <Home className="h-5 w-5 text-primary" /> {property.beds ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Bathrooms</p>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        <Bath className="h-5 w-5 text-primary" /> {property.baths ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Square Feet</p>
                      <p className="text-2xl font-bold flex items-center gap-2">
                        <Maximize2 className="h-5 w-5 text-primary" /> {property.sqft ? property.sqft.toLocaleString() : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Year Built</p>
                      <p className="text-2xl font-bold">{property.yearBuilt || property.year_built || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Type</p>
                      <p className="text-lg font-semibold capitalize">{property.type || property.propertyType || "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Price/Sqft</p>
                      <p className="text-lg font-semibold text-primary">
                        {property.sqft && property.price 
                          ? `₦${Math.round(property.price / property.sqft).toLocaleString()}`
                          : "—"
                        }
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Description */}
                <div>
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">{property.description}</p>

                  <h3 className="font-bold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(property.amenities || []).map((amenity) => (
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
                      <p className="font-bold text-primary">{property.aiAnalysis?.marketTrend ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">ROI Potential</p>
                      <p className="font-bold text-accent">{property.aiAnalysis?.roiPotential ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Valuation Grade</p>
                      <p className="font-bold text-lg">{property.aiAnalysis?.valuationGrade ?? "—"}</p>
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
                <Card className="p-6">
                  <h3 className="font-bold mb-4">Contact Agent</h3>
                  <div className="text-center mb-6">
                    <img src={property.agent?.image || "/placeholder.svg"} alt={property.agent?.name || "Agent"} className="w-16 h-16 rounded-full mx-auto mb-3 object-cover" />
                    <p className="font-semibold">{property.agent?.name ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">Real Estate Specialist</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button className="w-full" size="sm" onClick={handleCallAgent}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call Agent
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" size="sm" onClick={() => setMessageModalOpen(true)}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Phone:</span> {property.agent?.phone ?? "—"}</p>
                    <p className="text-sm text-muted-foreground break-all"><span className="font-semibold">Email:</span> {property.agent?.email ?? "—"}</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                  {isBookingSubmitted ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <CheckCircle className="h-12 w-12 text-primary mb-3" />
                      <h3 className="font-bold text-center mb-1">Visit Scheduled!</h3>
                      <p className="text-sm text-muted-foreground text-center">Check your email for confirmation details.</p>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-bold mb-4">Schedule a Visit</h3>

                      <form onSubmit={handleBookingSubmit} className="space-y-3">
                        <Input type="text" placeholder="Full Name" value={bookingData.name} onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })} required />
                        <Input type="email" placeholder="Email" value={bookingData.email} onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })} required />
                        <Input type="tel" placeholder="Phone" value={bookingData.phone} onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })} required />
                        <div className="flex gap-2">
                          <Input type="date" className="flex-1" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })} required />
                          <Input type="time" className="flex-1" value={bookingData.time} onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })} required />
                        </div>
                        <Button type="submit" className="w-full" disabled={bookingLoading}>
                          <Calendar className="h-4 w-4 mr-2" />
                          {bookingLoading ? "Booking..." : "Book Visit"}
                        </Button>
                      </form>
                    </>
                  )}
                </Card>

                <Button variant="outline" className="w-full bg-transparent" onClick={() => toast({ title: "Report Submitted", description: "Thank you for reporting. We'll review this listing." })}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report This Listing
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />

      {/* Message Modal */}
      {messageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 relative">
            <button onClick={() => setMessageModalOpen(false)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Send Message</h2>
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  value={messageData.subject}
                  onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
                  placeholder="Inquiry about property..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <Textarea
                  value={messageData.content}
                  onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                  placeholder="I'm interested in this property..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setMessageModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={messageLoading}>
                  {messageLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}


      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  );
}
