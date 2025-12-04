"use client"

import type { ReactNode } from "react"
import { useToastNotification } from "@/hooks/use-toast-notification"
import { ToastContainer } from "@/components/toast-container"

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { toasts, removeToast } = useToastNotification()

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}
