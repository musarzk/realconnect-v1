"use client"

import type React from "react"
import { createContext, useState, useCallback, useEffect } from "react"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "user" | "agent" | "admin" | "investor"
  approved: boolean
}

export interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = localStorage.getItem("token")
        const tokenTimestamp = localStorage.getItem("tokenTimestamp")

        if (storedToken) {
          // Check if token is expired based on timestamp (24 hours max)
          const MAX_SESSION_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

          if (tokenTimestamp) {
            const loginTime = parseInt(tokenTimestamp, 10);
            const now = Date.now();
            const tokenAge = now - loginTime;

            // If token is older than 24 hours, clear it and don't attempt to load session
            if (tokenAge > MAX_SESSION_AGE) {
              localStorage.removeItem("token");
              localStorage.removeItem("tokenTimestamp");
              setToken(null);
              setIsLoading(false);
              return;
            }
          }

          setToken(storedToken)
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          })

          if (response.ok) {
            const data = await response.json()
            setUser({
              id: data._id,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              approved: data.approved,
            })
          } else {
            localStorage.removeItem("token")
            localStorage.removeItem("tokenTimestamp")
            setToken(null)
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem("token")
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    }
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("tokenTimestamp")
  }, [])

  // Auto-logout on inactivity
  useEffect(() => {
    if (!user) return;

    const INACTIVITY_LIMIT = 60 * 60 * 1000; // 1 hour
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT);
    };

    // Events to listen for
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];

    // Attach listeners
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Initial start
    resetTimer();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user, logout]);

  const signup = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, lastName }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Signup failed")
    }

    const data = await response.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("token", data.token)
    localStorage.setItem("tokenTimestamp", Date.now().toString())
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Login failed")
    }

    const data = await response.json()
    setToken(data.token)
    setUser(data.user)
    localStorage.setItem("token", data.token)
    localStorage.setItem("tokenTimestamp", Date.now().toString())
  }, [])



  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signup,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
