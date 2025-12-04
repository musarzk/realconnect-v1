"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error" | "info"
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

export function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  actionLabel,
  onAction,
}: StatusModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-md text-cente bg-white">
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          {type === "success" && (
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          )}
          {type === "error" && (
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          )}
          {type === "info" && (
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <AlertCircle className="h-10 w-10 text-blue-600" />
            </div>
          )}
          
          <DialogHeader>
            <DialogTitle className={cn(
              "text-2xl font-bold text-center",
              type === "success" && "text-green-700",
              type === "error" && "text-red-700",
              type === "info" && "text-blue-700"
            )}>
              {title}
            </DialogTitle>
          </DialogHeader>
          
          <DialogDescription className="text-muted-foreground text-center max-w-xs mx-auto">
            {message}
          </DialogDescription>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button 
            onClick={() => {
              if (onAction) onAction()
              onClose()
            }}
            className={cn(
              "w-full sm:w-auto min-w-[120px]",
              type === "success" && "bg-green-600 hover:bg-green-700",
              type === "error" && "bg-red-600 hover:bg-red-700",
              type === "info" && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {actionLabel || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
