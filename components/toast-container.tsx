"use client"

import type { Toast } from "@/hooks/use-toast-notification"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  const getToastStyles = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-right-2 duration-300 ${getToastStyles(
            toast.type,
          )}`}
        >
          {getIcon(toast.type)}
          <div className="flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => onRemove(toast.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
