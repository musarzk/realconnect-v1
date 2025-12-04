"use client"

import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { type ReactNode, useEffect } from "react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: "user" | "agent" | "admin"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    if (!isLoading && requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
      router.push("/")
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== "admin") {
    return null
  }

  return children
}
