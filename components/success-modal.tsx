"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessModalProps {
    isOpen: boolean
    title: string
    description: string
    buttonText?: string
    onClose: () => void
}

export function SuccessModal({
    isOpen,
    title,
    description,
    buttonText = "Continue",
    onClose,
}: SuccessModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <DialogTitle>{title}</DialogTitle>
                            <DialogDescription className="mt-1">
                                {description}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <Button type="button" onClick={onClose} className="w-full sm:w-auto">
                        {buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
