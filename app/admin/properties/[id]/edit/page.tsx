"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Check, ArrowLeft, Trash, Star, GripVertical } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function SortableImage({ id, url, onRemove, onSetPreview, isPreview }: {
  id: string;
  url: string;
  onRemove: (url: string) => void;
  onSetPreview: (url: string) => void;
  isPreview: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square rounded-lg overflow-hidden border bg-muted transition-shadow ${isDragging ? "shadow-2xl ring-2 ring-primary" : "hover:shadow-md"}`}
    >
      <img src={url} alt="Property" className="w-full h-full object-cover" />

      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-8 w-8 rounded-full"
          onClick={() => onSetPreview(url)}
          title="Set as preview"
        >
          <Star className={`h-4 w-4 ${isPreview ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="destructive"
          className="h-8 w-8 rounded-full"
          onClick={() => onRemove(url)}
          title="Delete image"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-md shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity border border-border"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {isPreview && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
          Main Preview
        </div>
      )}
    </div>
  );
}

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.images.indexOf(active.id as string);
        const newIndex = prev.images.indexOf(over.id as string);
        return {
          ...prev,
          images: arrayMove(prev.images, oldIndex, newIndex),
        };
      });
    }
  };

  const handleRemoveImageRequest = (url: string) => {
    setImageToDelete(url);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteImage = () => {
    if (imageToDelete) {
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== imageToDelete),
      }));
      if (imagePreview === imageToDelete) {
        setImagePreview(formData.images.find((img) => img !== imageToDelete) || "");
      }
    }
    setShowDeleteConfirm(false);
    setImageToDelete(null);
  };

  const handleSetPreview = (url: string) => {
    setFormData((prev) => {
      const filtered = prev.images.filter((img) => img !== url);
      return {
        ...prev,
        images: [url, ...filtered],
      };
    });
    setImagePreview(url);
  };

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

    // Check for size limits (10MB)
    const validFiles = list.filter(file => file.size <= 10 * 1024 * 1024);
    if (validFiles.length < list.length) {
      alert("Some files were skipped because they exceed the 10MB limit.");
    }

    const readers = validFiles.map(
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
        setFormData((prev) => {
          const newImages = [...prev.images, ...dataUrls];
          if (!imagePreview && newImages.length > 0) {
            setImagePreview(newImages[0]);
          }
          return { ...prev, images: newImages };
        });
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
      yearBuilt: formData.yearBuilt ? Number(formData.yearBuilt) : undefined,
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
                <div>
                  <label className="text-sm font-medium mb-2 block">Year Built</label>
                  <Input
                    type="number"
                    name="yearBuilt"
                    placeholder="Year property was built"
                    value={formData.yearBuilt}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Property Images</label>
                  <span className="text-xs text-muted-foreground">{formData.images.length} images uploaded</span>
                </div>

                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30 hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer group">
                    <div className="bg-background w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB each</p>
                  </label>
                </div>

                {formData.images.length > 0 && (
                  <div className="mt-8">
                    <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">Drag to reorder • First image is preview</p>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={formData.images}
                        strategy={rectSortingStrategy}
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.images.map((img, idx) => (
                            <SortableImage
                              key={img}
                              id={img}
                              url={img}
                              onRemove={handleRemoveImageRequest}
                              onSetPreview={handleSetPreview}
                              isPreview={idx === 0}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="flex-1"
            >
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={() => setCurrentStep(currentStep + 1)} disabled={!isStepValid()} className="flex-1">
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={submitting || !isStepValid()} className="flex-1">
                {submitting ? "Updating..." : "Update Property"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this image? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {imageToDelete && (
              <img
                src={imageToDelete}
                alt="To delete"
                className="w-full h-48 object-cover rounded-lg border"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteImage}
            >
              Remove Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
