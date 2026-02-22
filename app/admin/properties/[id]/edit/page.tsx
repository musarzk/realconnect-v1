"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
  title: string;
  description: string;
  propertyType: string;
  listingType: "sale" | "rent";
  location: string;
  country: string;
  city: string;
  postalCode: string;

  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  yearBuilt: string;
  garage: string;

  price: string;
  priceUsd: string;
  rentalPrice: string;

  features: Record<string, boolean>;

  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  agentName: string;
  agentPhone: string;

  images: string[]; // data-uris or urls
};

export default function EditPropertyPage() {
  const params = useParams() as Record<string, string> | null;
  const router = useRouter();
  const id = params?.id ?? null;

  // Debug logging
  // console.log("EditPropertyPage - Property ID from params:", id);
  // console.log("EditPropertyPage - Full params:", params);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState<boolean>(!!id); // loading only if we have an id to fetch
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState<FormState>({
    title: "",
    description: "",
    propertyType: "apartment",
    listingType: "sale",
    location: "",
    country: "",
    city: "",
    postalCode: "",

    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    yearBuilt: "",
    garage: "",

    price: "",
    priceUsd: "",
    rentalPrice: "",

    features: {
      parking: false,
      pool: false,
      garden: false,
      gym: false,
      balcony: false,
      aircondition: false,
    },

    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    agentName: "",
    agentPhone: "",

    images: [],
  });

  // Fetch property details by id and populate form
  async function fetchProperty() {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, { cache: "no-store" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || `Failed to fetch property (${res.status})`);
      }

      const data = await res.json();

      // inside fetchProperty(), after `const data = await res.json();`
setFormData((prev) => ({
  ...prev,
  title: data.title ?? prev.title,
  description: data.description ?? prev.description,
  propertyType: data.type ?? prev.propertyType,

  // CORRECTED: only map when data.listingType is present, otherwise keep prev
  listingType: data.listingType
    ? (data.listingType === "rent" ? "rent" : "sale")
    : prev.listingType,

  location: data.location ?? prev.location,
  country: data.country ?? prev.country,
  city: data.city ?? prev.city,
  postalCode: data.postalCode ?? prev.postalCode,

  bedrooms: data.beds != null ? String(data.beds) : prev.bedrooms,
  bathrooms: data.baths != null ? String(data.baths) : prev.bathrooms,
  squareFeet: data.sqft != null ? String(data.sqft) : prev.squareFeet,
  yearBuilt: data.yearBuilt != null ? String(data.yearBuilt) : prev.yearBuilt,
  garage: data.garage ?? prev.garage,

  price: data.price != null ? String(data.price) : prev.price,
  priceUsd: data.priceUsd != null ? String(data.priceUsd) : prev.priceUsd,
  rentalPrice: data.rentalPrice != null ? String(data.rentalPrice) : prev.rentalPrice,

  features: {
    ...prev.features,
    ...(Array.isArray(data.amenities)
      ? data.amenities.reduce((acc: Record<string, boolean>, a: string) => {
          acc[a] = true;
          return acc;
        }, {})
      : {}),
    ...(data.features ?? {}),
  },

  ownerName: data.contact?.name ?? prev.ownerName,
  ownerEmail: data.contact?.email ?? prev.ownerEmail,
  ownerPhone: data.contact?.phone ?? prev.ownerPhone,

  images: Array.isArray(data.images) ? data.images : prev.images,
}));
      // set image preview to first image if present
      if (Array.isArray(data.images) && data.images.length > 0) {
        setImagePreview(data.images[0]);
      }
    } catch (err: any) {
      console.error("Error fetching property:", err);
      setSubmitError(err?.message ?? "Failed to load property details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch only when id is available
    if (!id) {
      setLoading(false);
      return;
    }
    fetchProperty();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const { name, value, type, checked } = target as HTMLInputElement;
    // for checkboxes we have handleFeatureChange; here we treat everything as value
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    const readers = list.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => {
            if (typeof r.result === "string") resolve(r.result);
            else reject(new Error("Unexpected file reader result"));
          };
          r.onerror = reject;
          r.readAsDataURL(file);
        })
    );
    Promise.all(readers)
      .then((dataUrls) => {
        setFormData((prev) => ({ ...prev, images: [...prev.images, ...dataUrls] }));
        setImagePreview((prev) => prev || dataUrls[0] || "");
      })
      .catch((err) => {
        console.error("Image read failed", err);
      });
  };

  function buildPayload() {
    const type =
      formData.propertyType === "apartment"
        ? "residential"
        : formData.propertyType === "residential"
        ? "residential"
        : formData.propertyType === "office"
        ? "commercial"
        : formData.propertyType === "commercial"
        ? "commercial"
        : formData.propertyType === "land"
        ? "land"
        : "residential";

    const amenities = Object.entries(formData.features).filter(([, v]) => v).map(([k]) => k);

    return {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price ?? 0),
      priceUsd: formData.priceUsd ? Number(formData.priceUsd) : null,
      listingType: formData.listingType,
      location: formData.location,
      type,
      beds: formData.bedrooms ? Number(formData.bedrooms) : undefined,
      baths: formData.bathrooms ? Number(formData.bathrooms) : undefined,
      sqft: formData.squareFeet ? Number(formData.squareFeet) : undefined,
      images: formData.images ?? [],
      amenities,
      contact: {
        name: formData.ownerName,
        email: formData.ownerEmail,
        phone: formData.ownerPhone,
      },
    };
  }

  async function handleSubmit() {
    if (!isStepValid()) {
      alert("Please complete required fields for this step.");
      return;
    }

    if (!id) {
      setSubmitError("Missing property id");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload();
      const headerToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch(`/api/properties/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(headerToken ? { Authorization: `Bearer ${headerToken}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = json?.error || `Request failed (${res.status})`;
        setSubmitError(errMsg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      alert("Property updated successfully");
      router.push("/admin/properties");
    } catch (err: any) {
      console.error("Submit error", err);
      setSubmitError(err?.message ?? "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.title && !!formData.description && !!formData.propertyType && !!formData.listingType && !!formData.location;
      case 2:
        return true; // Relaxed validation for edit
      case 3:
        return !!formData.price && !!formData.ownerName && !!formData.ownerEmail && !!formData.ownerPhone;
      default:
        return false;
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/admin/properties">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Property</h1>
            <p className="text-muted-foreground">Update property details</p>
          </div>
        </div>

        {submitError && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">{submitError}</div>}

        {/* Progress indicator */}
        <div className="mb-12">
          <div className="flex gap-2 sm:gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1">
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${currentStep === step ? "bg-primary text-primary-foreground" : step < currentStep ? "bg-green-100 text-green-800" : "bg-secondary text-secondary-foreground"
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {step < currentStep ? (
                      <>
                        <Check className="h-4 w-4" />
                        Step {step}
                      </>
                    ) : (
                      `Step ${step}`
                    )}
                  </div>
                  <div className="text-xs mt-1 opacity-75">{step === 1 ? "Basic Info" : step === 2 ? "Details" : "Contact & Pricing"}</div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Basic Information</h2>
              <div>
                <label className="text-sm font-medium mb-2 block">Property Title *</label>
                <Input name="title" placeholder="e.g., Modern Apartment in Downtown" value={formData.title} onChange={handleInputChange} />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description *</label>
                <Textarea name="description" placeholder="Describe your property in detail..." value={formData.description} onChange={handleInputChange} rows={5} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Listing Type *</label>
                  <select name="listingType" value={formData.listingType} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-lg bg-background">
                    <option value="sale">For Sale</option>
                    <option value="rent">For Rent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Property Type *</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full px-4 py-2 border border-border rounded-lg bg-background">
                    <option value="apartment">Apartment</option>
                    <option value="residential">Residential</option>
                    <option value="office">Office</option>
                    <option value="commercial">Commercial</option>
                    <option value="land">Land</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Location *</label>
                  <Input
                    name="location"
                    placeholder="Full address"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Property Details</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms</label>
                  <Input
                    type="number"
                    name="bedrooms"
                    placeholder="Number of bedrooms"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bathrooms</label>
                  <Input
                    type="number"
                    name="bathrooms"
                    placeholder="Number of bathrooms"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Square Feet</label>
                  <Input
                    type="number"
                    name="squareFeet"
                    placeholder="Total square feet"
                    value={formData.squareFeet}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-4 block">Amenities & Features</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { key: "parking", label: "Parking" },
                    { key: "pool", label: "Pool" },
                    { key: "garden", label: "Garden" },
                    { key: "gym", label: "Gym" },
                    { key: "balcony", label: "Balcony" },
                    { key: "aircondition", label: "Air Conditioning" },
                  ].map((feature) => (
                    <label key={feature.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!formData.features[feature.key]}
                        onChange={() => handleFeatureChange(feature.key)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Contact Information & Pricing</h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-4">Owner Contact Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Owner Name *</label>
                    <Input
                      name="ownerName"
                      placeholder="Full name"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Owner Email *</label>
                    <Input
                      type="email"
                      name="ownerEmail"
                      placeholder="email@example.com"
                      value={formData.ownerEmail}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Owner Phone *</label>
                    <Input
                      type="tel"
                      name="ownerPhone"
                      placeholder="+1 (555) 000-0000"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {formData.listingType === "sale" ? "Sale Price (NGN)" : "Monthly Rent (NGN)"} *
                  </label>
                  <Input
                    type="number"
                    name="price"
                    placeholder={formData.listingType === "sale" ? "Asking price" : "Monthly rent"}
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($) (Optional)</label>
                  <Input
                    type="number"
                    name="priceUsd"
                    placeholder="Price in USD"
                    value={formData.priceUsd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Property Images</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Preview ${idx}`}
                        className="h-24 w-full object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1"
            >
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!isStepValid()} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !isStepValid()} className="flex-1">
                {submitting ? "Updating..." : "Update Property"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
