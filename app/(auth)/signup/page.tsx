"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { z } from "zod";
import { SuccessModal } from "@/components/success-modal";

import { Eye, EyeOff } from "lucide-react";

import Image from "next/image";

const SignupBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  password: z.string().min(6),
});

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // client-side quick validation
    const parsed = SignupBodySchema.safeParse({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
    });
    if (!parsed.success) {
      setError(parsed.error.errors[0].message);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        // show zod/server provided error or fallback
        const msg = json?.error || json?.message || `Registration failed (${res.status})`;
        throw new Error(msg);
      }

      // success: show modal
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="SmartReal Logo" width={180} height={54} className="h-14 w-auto object-contain" />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center">Create Account</h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <Input
            type="tel"
            placeholder="Phone Number (optional)"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 6 chars)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </Card>

      <SuccessModal
        isOpen={showSuccessModal}
        title="Account Created Successfully"
        description="Your account has been created and is pending admin approval. You will be notified once your account is active."
        buttonText="Go to Login"
        onClose={handleSuccessClose}
      />
    </div>
  );
}
