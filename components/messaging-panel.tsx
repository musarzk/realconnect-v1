"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, X } from "lucide-react"

interface Message {
  id: string
  sender: string
  senderRole: "user" | "agent" | "admin"
  content: string
  timestamp: Date
  read: boolean
}

interface MessagingPanelProps {
  isOpen: boolean
  onClose: () => void
  messages?: Message[]
  onSendMessage?: (message: string) => void
}

export function MessagingPanel({ isOpen, onClose, messages = [], onSendMessage }: MessagingPanelProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!newMessage.trim()) return

    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onSendMessage?.(newMessage)
      setNewMessage("")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-0 right-0 top-0 z-40 w-full sm:w-96 bg-background border-l border-border shadow-lg flex flex-col animate-in slide-in-from-right-2 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold">Messages</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`p-3 rounded-lg ${
                message.senderRole === "user"
                  ? "bg-primary text-primary-foreground ml-8"
                  : "bg-secondary text-secondary-foreground mr-8"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-xs font-semibold mb-1 opacity-75">{message.sender}</p>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
              <p className="text-xs opacity-50 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) {
                handleSend()
              }
            }}
            className="min-h-12 max-h-24 resize-none"
          />
          <Button onClick={handleSend} disabled={!newMessage.trim() || isLoading} size="sm" className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Ctrl+Enter to send</p>
      </div>
    </div>
  )
}
