import type { User } from "@/context/auth-context"

export async function authFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await authFetch("/api/auth/me")
    if (!response.ok) return null
    return response.json()
  } catch (error) {
    return null
  }
}
