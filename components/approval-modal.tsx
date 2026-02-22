"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, XCircle } from "lucide-react"

interface ApprovalModalProps {
  isOpen: boolean
  title: string
  itemName: string
  currentStatus?: string
  targetStatus?: string
  isLoading?: boolean
  onApprove: () => void
  onReject: (reason: string) => void
  onCancel: () => void
}

export function ApprovalModal({
  isOpen,
  title,
  itemName,
  currentStatus = "pending",
  targetStatus = "approved",
  isLoading = false,
  onApprove,
  onReject,
  onCancel,
}: ApprovalModalProps) {
  const [rejectReason, setRejectReason] = useState("")
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!isOpen) return null

  // Dynamic button label based on target status
  const getActionLabel = () => {
    switch (targetStatus) {
      case "approved": return "Approve"
      case "suspended": return "Suspend"
      case "sold": return "Mark as Sold"
      case "rejected": return "Reject"
      default: return "Confirm"
    }
  }

  const getActionIcon = () => {
    if (targetStatus === "rejected") return <XCircle className="h-4 w-4 mr-2" />
    return <CheckCircle className="h-4 w-4 mr-2" />
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Item: <span className="font-bold text-primary">{itemName}</span>
        </p>

        {!showRejectForm ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button variant="outline" onClick={() => setShowRejectForm(true)} disabled={isLoading} className="flex-1">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button onClick={() => onApprove()} disabled={isLoading} className="flex-1">
              {getActionIcon()}
              {getActionLabel()}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Rejection Reason (required)</label>
              <Textarea
                placeholder="Explain why this property is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-2 min-h-24"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectForm(false)
                  setRejectReason("")
                }}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onReject(rejectReason)
                  setRejectReason("")
                  setShowRejectForm(false)
                }}
                disabled={isLoading || !rejectReason.trim()}
                className="flex-1"
              >
                {isLoading ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
