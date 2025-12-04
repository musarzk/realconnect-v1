"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MessageCircle, Search, Send, Loader } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface Message {
  id: string
  sender: string
  senderRole: "user" | "agent" | "admin"
  content: string
  timestamp: Date
  read: boolean
}

interface Conversation {
  id: string
  recipient: string
  recipientRole: string
  lastMessage: string
  lastMessageTime: Date
  messages: Message[]
  unread: number
}

const NOW = Date.now()

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const userId = user?.id

  useEffect(() => {
    if (userId) {
      fetchConversations()
    }
  }, [userId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/messages", { cache: "no-store" })
      
      if (!res.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const messages: any[] = await res.json()
      
      // Group messages by conversation partner
      const groups: { [key: string]: Message[] } = {}
      
      messages.forEach((msg) => {
        // Determine the other person
        let otherId = msg.senderId === userId ? msg.recipientId : msg.senderId
        let otherName = msg.senderId === userId ? "Admin" : msg.senderName // Default to Admin if recipient is null
        let otherRole = "admin"

        if (msg.senderId === userId) {
           // I sent it
           if (msg.recipientId) {
             // To a specific user (agent/owner) - we don't have their name easily here without extra fetch, 
             // but maybe we can infer or just use "Agent" if unknown.
             // For now, let's use a placeholder or try to find a message FROM them to get their name.
             otherId = msg.recipientId
             otherRole = "agent" // Assumption
             otherName = "Agent" 
           } else {
             // To Admin
             otherId = "admin"
             otherName = "Admin"
             otherRole = "admin"
           }
        } else {
          // I received it
          otherId = msg.senderId
          otherName = msg.senderName
          otherRole = "agent" // If I received it, likely from agent or admin. 
          if (!msg.senderId) {
             otherRole = "admin"
             otherName = "Admin"
          }
        }

        const convId = otherId || "admin"
        
        if (!groups[convId]) {
          groups[convId] = []
        }

        groups[convId].push({
          id: msg._id,
          sender: msg.senderName,
          senderRole: msg.senderId === userId ? "user" : (msg.senderId ? "agent" : "admin"),
          content: msg.content,
          timestamp: new Date(msg.createdAt),
          read: msg.status === "read"
        })
      })

      // Convert groups to Conversation objects
      const newConversations: Conversation[] = Object.keys(groups).map(key => {
        const msgs = groups[key].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        const lastMsg = msgs[msgs.length - 1]
        
        // Try to find a name from messages received
        const receivedMsg = msgs.find(m => m.senderRole !== "user")
        const recipientName = receivedMsg ? receivedMsg.sender : (key === "admin" ? "Admin" : "Agent")
        const recipientRole = receivedMsg ? receivedMsg.senderRole : (key === "admin" ? "Admin" : "Agent")

        return {
          id: key,
          recipient: recipientName,
          recipientRole: recipientRole,
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.timestamp,
          messages: msgs,
          unread: msgs.filter(m => !m.read && m.senderRole !== "user").length
        }
      })

      setConversations(newConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime()))
    } catch (err: any) {
      console.error("Failed to fetch conversations:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.recipient.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: [
              ...conv.messages,
              {
                id: Math.random().toString(),
                sender: "You",
                senderRole: "user",
                content: newMessage,
                timestamp: new Date(),
                read: true,
              },
            ],
            lastMessage: newMessage,
            lastMessageTime: new Date(),
          }
        }
        return conv
      }),
    )
    setNewMessage("")
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Stay connected with agents, buyers, and admins</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full text-left p-4 border-b border-border transition-colors hover:bg-secondary/50 ${
                    selectedConversation === conv.id ? "bg-secondary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{conv.recipient}</h3>
                    {conv.unread > 0 && (
                      <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{conv.lastMessage}</p>
                  <p className="text-xs text-muted-foreground mt-1">{conv.lastMessageTime.toLocaleDateString()}</p>
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations found</p>
                </div>
              )}
            </div>
          </Card>

          {/* Chat Area */}
          {selectedConv ? (
            <Card className="lg:col-span-2 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold">{selectedConv.recipient}</h2>
                <p className="text-xs text-muted-foreground">{selectedConv.recipientRole}</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConv.messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderRole === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderRole === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs opacity-50 mt-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage()
                      }
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="lg:col-span-2 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
