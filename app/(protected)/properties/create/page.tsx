// app/(protected)/properties/create/page.tsx
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreatePropertySchema, type CreatePropertyInput } from "@/app/api/lib/schemavalidation/property-schema";
import { useRouter } from "next/navigation";

export default function CreatePropertyPage() {
  const router = useRouter();
  const [showUsd, setShowUsd] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePropertyInput>({
    resolver: zodResolver(CreatePropertySchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      priceUsd: undefined,
      listingType: "sale",
      location: "",
      type: "residential",
      images: [],
      amenities: [],
      contact: { name: "", email: "", phone: "" }
    }
  });

  async function onSubmit(values: CreatePropertyInput) {
    const payload: any = { ...values };
    if (!showUsd) delete payload.priceUsd;
    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const json = await res.json();
      router.push(`/property/${json.id}`);
    } else {
      const err = await res.json();
      alert(err.error || "Create failed");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">List Your Property</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label>Title</label>
          <input {...register("title")} className="w-full" />
          {errors.title && <p className="text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label>Description</label>
          <textarea {...register("description")} className="w-full" rows={4} />
          {errors.description && <p className="text-red-600">{errors.description.message}</p>}
        </div>

        <div>
          <label>Price (₦)</label>
          <input type="number" step="1" {...register("price", { valueAsNumber: true })} className="w-full" />
          {errors.price && <p className="text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label>
            <input type="checkbox" checked={showUsd} onChange={() => setShowUsd(!showUsd)} /> Add USD value (optional)
          </label>
        </div>

        {showUsd && (
          <div>
            <label>Price (USD) — manual</label>
            <input type="number" step="0.01" {...register("priceUsd", { valueAsNumber: true })} className="w-full" />
            {errors.priceUsd && <p className="text-red-600">{errors.priceUsd.message}</p>}
          </div>
        )}

        <div>
          <label>Listing Type</label>
          <select {...register("listingType")} className="w-full">
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
        </div>

        <div>
          <label>Location</label>
          <input {...register("location")} className="w-full" />
        </div>

        <div>
          <label>Type</label>
          <select {...register("type")} className="w-full">
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="land">Land</option>
          </select>
        </div>

        <div>
          <label>Contact Name</label>
          <input {...register("contact.name")} className="w-full" />
        </div>

        <div>
          <label>Contact Email</label>
          <input {...register("contact.email")} className="w-full" />
        </div>

        <div>
          <label>Contact Phone</label>
          <input {...register("contact.phone")} className="w-full" />
        </div>

        <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-4 py-2 rounded">
          Publish Property
        </button>
      </form>
    </div>
  );
}
