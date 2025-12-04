"use client"

import { useState, useCallback } from "react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

export interface ToastOptions {
  title: string
  description: string
  type?: ToastType
}

export function useToastNotification() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        // Avoid accessing removeToast before declaration by calling setToasts directly
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  return {
    toasts,
    addToast,
    removeToast,
    success: (message: string, duration?: number) => addToast(message, "success", duration),
    error: (message: string, duration?: number) => addToast(message, "error", duration),
    info: (message: string, duration?: number) => addToast(message, "info", duration),
    warning: (message: string, duration?: number) => addToast(message, "warning", duration),
  }
}

export function useToast() {
  const notification = useToastNotification()

  return {
    toast: (options: ToastOptions) => {
      const message = `${options.title}\n${options.description}`
      notification.addToast(message, options.type || "info", 4000)
    },
    ...notification,
  }
}
