// "use client"

// import type React from "react"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import { Navigation } from "@/components/navigation"
// import { Footer } from "@/components/footer"
// import { Upload, Check } from "lucide-react"

// export default function ListPropertyPage() {
//   const [currentStep, setCurrentStep] = useState(1)
//   const [formData, setFormData] = useState({
//     // Basic Info
//     title: "",
//     description: "",
//     propertyType: "apartment",
//     listingType: "sale", // Added listingType field to form data with default "sale"
//     location: "",
//     country: "",
//     city: "",
//     postalCode: "",

//     // Details
//     bedrooms: "",
//     bathrooms: "",
//     squareFeet: "",
//     yearBuilt: "",
//     garage: "",

//     // Pricing
//     price: "",
//     rentalPrice: "",

//     // Features
//     features: {
//       parking: false,
//       pool: false,
//       garden: false,
//       gym: false,
//       balcony: false,
//       aircondition: false,
//     },

//     // Contact Information
//     ownerName: "",
//     ownerEmail: "",
//     ownerPhone: "",
//     agentName: "",
//     agentPhone: "",

//     // Images
//     images: [] as string[],
//   })

//   const [imagePreview, setImagePreview] = useState<string>("")

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleFeatureChange = (feature: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       features: {
//         ...prev.features,
//         [feature]: !prev.features[feature as keyof typeof prev.features],
//       },
//     }))
//   }

//   const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (file) {
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         setImagePreview(reader.result as string)
//       }
//       reader.readAsDataURL(file)
//     }
//   }

//   const handleSubmit = () => {
//     console.log("Form submitted:", formData)
//     // Submit to API
//   }

//   const isStepValid = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           formData.title && formData.description && formData.propertyType && formData.listingType && formData.location
//         )
//       case 2:
//         return formData.bedrooms && formData.bathrooms && formData.squareFeet
//       case 3:
//         return formData.price && formData.ownerName && formData.ownerEmail && formData.ownerPhone
//       default:
//         return false
//     }
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <Navigation />

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//         <div className="mb-12">
//           <h1 className="text-4xl font-bold mb-2">List Your Property</h1>
//           <p className="text-muted-foreground">Complete the form below to list your property on SmartReal</p>
//         </div>

//         {/* Progress Indicator */}
//         <div className="mb-12">
//           <div className="flex gap-2 sm:gap-4">
//             {[1, 2, 3].map((step) => (
//               <div key={step} className="flex-1">
//                 <button
//                   onClick={() => setCurrentStep(step)}
//                   className={`w-full py-3 rounded-lg font-semibold transition-all ${
//                     currentStep === step
//                       ? "bg-primary text-primary-foreground"
//                       : step < currentStep
//                         ? "bg-green-100 text-green-800"
//                         : "bg-secondary text-secondary-foreground"
//                   }`}
//                 >
//                   <div className="flex items-center justify-center gap-2">
//                     {step < currentStep ? (
//                       <>
//                         <Check className="h-4 w-4" />
//                         Step {step}
//                       </>
//                     ) : (
//                       `Step ${step}`
//                     )}
//                   </div>
//                   <div className="text-xs mt-1 opacity-75">
//                     {step === 1 && "Basic Info"}
//                     {step === 2 && "Details"}
//                     {step === 3 && "Contact & Pricing"}
//                   </div>
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <Card className="p-8">
//           {/* Step 1: Basic Information */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold">Basic Information</h2>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">Property Title *</label>
//                 <Input
//                   name="title"
//                   placeholder="e.g., Modern Apartment in Downtown"
//                   value={formData.title}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">Description *</label>
//                 <Textarea
//                   name="description"
//                   placeholder="Describe your property in detail..."
//                   value={formData.description}
//                   onChange={handleInputChange}
//                   rows={5}
//                 />
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Listing Type *</label>
//                   <select
//                     name="listingType"
//                     value={formData.listingType}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-border rounded-lg bg-background"
//                   >
//                     <option value="sale">For Sale</option>
//                     <option value="rent">For Rent</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Property Type *</label>
//                   <select
//                     name="propertyType"
//                     value={formData.propertyType}
//                     onChange={handleInputChange}
//                     className="w-full px-4 py-2 border border-border rounded-lg bg-background"
//                   >
//                     <option value="apartment">Apartment</option>
//                     <option value="house">House</option>
//                     <option value="villa">Villa</option>
//                     <option value="commercial">Commercial</option>
//                     <option value="land">Land</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Location *</label>
//                   <Input
//                     name="location"
//                     placeholder="Full address"
//                     value={formData.location}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">City</label>
//                   <Input name="city" placeholder="City" value={formData.city} onChange={handleLocationChange} />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Country</label>
//                   <Input
//                     name="country"
//                     placeholder="Country"
//                     value={formData.country}
//                     onChange={handleLocationChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Postal Code</label>
//                   <Input
//                     name="postalCode"
//                     placeholder="Postal Code"
//                     value={formData.postalCode}
//                     onChange={handleLocationChange}
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 2: Property Details */}
//           {currentStep === 2 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold">Property Details</h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Bedrooms *</label>
//                   <Input
//                     type="number"
//                     name="bedrooms"
//                     placeholder="Number of bedrooms"
//                     value={formData.bedrooms}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Bathrooms *</label>
//                   <Input
//                     type="number"
//                     name="bathrooms"
//                     placeholder="Number of bathrooms"
//                     value={formData.bathrooms}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Square Feet *</label>
//                   <Input
//                     type="number"
//                     name="squareFeet"
//                     placeholder="Total square feet"
//                     value={formData.squareFeet}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">Year Built</label>
//                   <Input
//                     type="number"
//                     name="yearBuilt"
//                     placeholder="Year property was built"
//                     value={formData.yearBuilt}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">Garage Spaces</label>
//                 <Input
//                   type="number"
//                   name="garage"
//                   placeholder="Number of garage spaces"
//                   value={formData.garage}
//                   onChange={handleInputChange}
//                 />
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-4 block">Amenities & Features</label>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
//                   {[
//                     { key: "parking", label: "Parking" },
//                     { key: "pool", label: "Pool" },
//                     { key: "garden", label: "Garden" },
//                     { key: "gym", label: "Gym" },
//                     { key: "balcony", label: "Balcony" },
//                     { key: "aircondition", label: "Air Conditioning" },
//                   ].map((feature) => (
//                     <label key={feature.key} className="flex items-center gap-2 cursor-pointer">
//                       <input
//                         type="checkbox"
//                         checked={formData.features[feature.key as keyof typeof formData.features]}
//                         onChange={() => handleFeatureChange(feature.key)}
//                         className="w-4 h-4 rounded"
//                       />
//                       <span className="text-sm">{feature.label}</span>
//                     </label>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Contact & Pricing */}
//           {currentStep === 3 && (
//             <div className="space-y-6">
//               <h2 className="text-2xl font-bold">Contact Information & Pricing</h2>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                 <h3 className="font-semibold text-blue-900 mb-4">Owner/Agent Contact Details</h3>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">Owner Name *</label>
//                     <Input
//                       name="ownerName"
//                       placeholder="Full name"
//                       value={formData.ownerName}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">Owner Email *</label>
//                     <Input
//                       type="email"
//                       name="ownerEmail"
//                       placeholder="email@example.com"
//                       value={formData.ownerEmail}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">Owner Phone *</label>
//                     <Input
//                       type="tel"
//                       name="ownerPhone"
//                       placeholder="+1 (555) 000-0000"
//                       value={formData.ownerPhone}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">Agent Name (Optional)</label>
//                     <Input
//                       name="agentName"
//                       placeholder="Agent name"
//                       value={formData.agentName}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-4">
//                   <label className="text-sm font-medium mb-2 block">Agent Phone (Optional)</label>
//                   <Input
//                     type="tel"
//                     name="agentPhone"
//                     placeholder="+1 (555) 000-0000"
//                     value={formData.agentPhone}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-sm font-medium mb-2 block">
//                     {formData.listingType === "sale" ? "Sale Price (USD)" : "Monthly Rent (USD)"} *
//                   </label>
//                   <Input
//                     type="number"
//                     name="price"
//                     placeholder={formData.listingType === "sale" ? "Asking price" : "Monthly rent"}
//                     value={formData.price}
//                     onChange={handleInputChange}
//                   />
//                 </div>
//                 {formData.listingType === "sale" && (
//                   <div>
//                     <label className="text-sm font-medium mb-2 block">Monthly Rental (Optional)</label>
//                     <Input
//                       type="number"
//                       name="rentalPrice"
//                       placeholder="Monthly rental price"
//                       value={formData.rentalPrice}
//                       onChange={handleInputChange}
//                     />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <label className="text-sm font-medium mb-2 block">Property Images</label>
//                 <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     onChange={handleImageUpload}
//                     className="hidden"
//                     id="image-upload"
//                   />
//                   <label htmlFor="image-upload" className="cursor-pointer">
//                     <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
//                     <p className="text-sm font-medium">Click to upload or drag and drop</p>
//                     <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
//                   </label>
//                 </div>
//                 {imagePreview && (
//                   <div className="mt-4">
//                     <img
//                       src={imagePreview || "/placeholder.svg"}
//                       alt="Preview"
//                       className="h-32 w-32 object-cover rounded-lg"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Navigation Buttons */}
//           <div className="flex gap-4 mt-8 pt-8 border-t border-border">
//             <Button
//               variant="outline"
//               onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
//               disabled={currentStep === 1}
//               className="flex-1"
//             >
//               Previous
//             </Button>
//             {currentStep < 3 ? (
//               <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!isStepValid()} className="flex-1">
//                 Next
//               </Button>
//             ) : (
//               <Button onClick={handleSubmit} disabled={!isStepValid()} className="flex-1">
//                 Publish Property
//               </Button>
//             )}
//           </div>
//         </Card>
//       </div>

//       <Footer />
//     </div>
//   )
// }

// // /////////////////////////JUST TESING ////////////////////////////////////////////

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Upload, Check } from "lucide-react";

/**
 * Client ListPropertyPage
 * - buildPayload() maps UI form to CreatePropertySchema shape
 * - handleImageUpload converts files to data-URI and stores in formData.images
 * - handleSubmit posts to /api/properties with credentials: 'include'
 */

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

  images: string[]; // data-uris
};

export default function ListPropertyPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
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

  // generic input handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: { ...prev.features, [feature]: !prev.features[feature] },
    }));
  };

  // convert file(s) -> dataURL and store the URIs
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

  // Build payload to match your CreatePropertySchema
  function buildPayload() {
    // Convert propertyType from UI to schema 'type'
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

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildPayload();

      // If you store tokens in localStorage, include it in the Authorization header.
      const headerToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(headerToken ? { Authorization: `Bearer ${headerToken}` } : {}),
        },
        credentials: "include", // IMPORTANT: send cookies (httpOnly token) to server
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errMsg = json?.error || `Request failed (${res.status})`;
        setSubmitError(errMsg);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const newId = json?.id ?? json?._id ?? null;
      if (newId) {
        window.location.href = `/property/${String(newId)}`;
        return;
      }

      alert("Property created successfully");
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
        return !!formData.bedrooms && !!formData.bathrooms && !!formData.squareFeet;
      case 3:
        return !!formData.price && !!formData.ownerName && !!formData.ownerEmail && !!formData.ownerPhone;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">List Your Property</h1>
          <p className="text-muted-foreground">Complete the form below to list your property on SmartReal</p>
          {submitError && <div className="mt-4 text-red-600">{submitError}</div>}
        </div>

        {/* Progress indicator (unchanged) */}
        <div className="mb-12">
          <div className="flex gap-2 sm:gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex-1">
                <button
                  onClick={() => setCurrentStep(step)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    currentStep === step ? "bg-primary text-primary-foreground" : step < currentStep ? "bg-green-100 text-green-800" : "bg-secondary text-secondary-foreground"
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
                  <Input name="location" placeholder="Full address" value={formData.location} onChange={handleInputChange} />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Bedrooms *</label>
                  <Input type="number" name="bedrooms" placeholder="Number of bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bathrooms *</label>
                  <Input type="number" name="bathrooms" placeholder="Number of bathrooms" value={formData.bathrooms} onChange={handleInputChange} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Square Feet *</label>
                  <Input type="number" name="squareFeet" placeholder="Total square feet" value={formData.squareFeet} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year Built</label>
                  <Input type="number" name="yearBuilt" placeholder="Year property was built" value={formData.yearBuilt} onChange={handleInputChange} />
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
                      <input type="checkbox" checked={formData.features[feature.key]} onChange={() => handleFeatureChange(feature.key)} className="w-4 h-4 rounded" />
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
                <h3 className="font-semibold text-blue-900 mb-4">Owner/Agent Contact Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company's/Agent's Name *</label>
                    <Input name="ownerName" placeholder="Full name" value={formData.ownerName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company's/Agent's Email *</label>
                    <Input type="email" name="ownerEmail" placeholder="email@example.com" value={formData.ownerEmail} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company's/Agent's Phone *</label>
                    <Input type="tel" name="ownerPhone" placeholder="+..." value={formData.ownerPhone} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Company's/Agent's Name (Optional)</label>
                    <Input name="agentName" placeholder="Agent name" value={formData.agentName} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{formData.listingType === "sale" ? "Sale Price (NGN)" : "Monthly Rent (NGN)"} *</label>
                  <Input type="number" name="price" placeholder="Asking price (NGN)" value={formData.price} onChange={handleInputChange} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Price ($) (Optional)</label>
                  <Input type="number" name="priceUsd" placeholder="Price in USD" value={formData.priceUsd} onChange={handleInputChange} />
                </div>
              </div>

              {formData.listingType === "sale" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Monthly Rental (Optional)</label>
                    <Input type="number" name="rentalPrice" placeholder="Monthly rental price" value={formData.rentalPrice} onChange={handleInputChange} />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Property Images</label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" multiple />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-4">
                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg" />
                  </div>
                )}

                {formData.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.images.map((src, idx) => (
                      <div key={idx} className="h-20 w-full overflow-hidden rounded">
                        <img src={src} alt={`img-${idx}`} className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-border">
            <Button variant="outline" onClick={() => setCurrentStep(Math.max(1, currentStep - 1))} disabled={currentStep === 1} className="flex-1">
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!isStepValid()} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!isStepValid() || submitting} className="flex-1">
                {submitting ? "Publishing..." : "Publish Property"}
              </Button>
            )}
          </div>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

