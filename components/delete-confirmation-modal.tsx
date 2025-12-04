"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  title: string
  description: string
  itemName: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function DeleteConfirmationModal({
  isOpen,
  title,
  description,
  itemName,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <p className="mt-2 text-sm font-medium text-foreground">
              Item: <span className="font-bold text-red-600">{itemName}</span>
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
