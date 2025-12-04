"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone, MapPin, Save, Camera } from "lucide-react";
import type { ChangeEvent } from "react";
import { fileToDataUrl } from "@/utils/fileToDataUrl";
import { StatusModal } from "@/components/status-modal";

/**
 * Type for user prop
 */
type UserDTO = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  bio?: string | null;
  company?: string | null;
  specialization?: string | null;
  avatar?: string | null; // data-URL or path
  role?: string;
};

export default function ProfileCard({ user }: { user: UserDTO }) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Status Modal State
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // local editable state seeded from server props
  const [form, setForm] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    location: user.location || "",
    bio: user.bio || "",
    company: user.company || "",
    specialization: user.specialization || "",
    avatar: user.avatar || "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.avatar ?? null);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  // convert file to data URL for preview and upload payload
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        if (typeof r.result === "string") resolve(r.result);
        else reject(new Error("Failed to read file"));
      };
      r.onerror = () => reject(new Error("File read error"));
      r.readAsDataURL(file);
    });
  }

  async function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    setAvatarFile(f);
    try {
      const url = await fileToDataUrl(f);
      setPreview(url);
    } catch (err) {
      console.error("avatar read error", err);
    }
  }

  // Save -> call PUT /api/users/:id or server action. We'll call /api/users/me (example)
 async function handleSave() {
  setSaving(true);

  try {
    let avatarData = form.avatar; // default
    if (avatarFile) {
      // convert File → base64 data URL BEFORE sending to API
      avatarData = await fileToDataUrl(avatarFile);
    }

    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      location: form.location,
      bio: form.bio,
      company: form.company,
      specialization: form.specialization,
      avatar: avatarData,  // base64 or existing
    };

    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || "Save failed");
    }

    setIsEditing(false);
    setStatusModal({
      isOpen: true,
      type: "success",
      title: "Profile Updated",
      message: "Your profile has been successfully updated.",
    });
  } catch (err: any) {
    console.error("Save error", err);
    setStatusModal({
      isOpen: true,
      type: "error",
      title: "Update Failed",
      message: err?.message || "Failed to save profile. Please try again.",
    });
  } finally {
    setSaving(false);
  }
}


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <Card className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <label htmlFor="avatar-file" className="cursor-pointer block relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden group-hover:opacity-90 transition-opacity">
                  {preview ? (
                    <img src={preview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-primary-foreground" />
                  )}
                </div>
                {/* Overlay for hover effect */}
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white drop-shadow-md" />
                </div>
              </label>
              <input
                id="avatar-file"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {form.firstName} {form.lastName}
              </h2>
              <p className="text-muted-foreground">{form.company}</p>
              <p className="text-sm text-muted-foreground mt-1">{form.specialization}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsEditing((s) => !s)} variant={isEditing ? "default" : "outline"}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">{form.bio}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-secondary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{form.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-semibold">{form.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-semibold">{form.location}</p>
            </div>
          </div>
        </div>
      </Card>

      {isEditing && (
        <Card className="p-8 space-y-6">
          <h3 className="text-xl font-bold">Edit Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Name</label>
              <Input value={form.firstName} name="firstName" onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Last Name</label>
              <Input value={form.lastName} name="lastName" onChange={handleChange} />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input value={form.phone} name="phone" onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input value={form.location} name="location" onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Bio</label>
              <textarea
                value={form.bio}
                name="bio"
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Company</label>
              <Input value={form.company} name="company" onChange={handleChange} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Specialization</label>
              <Input value={form.specialization} name="specialization" onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        actionLabel="Close"
      />
    </div>
  );
}
