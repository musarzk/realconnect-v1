"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Eye, Reply, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { StatusModal } from "@/components/status-modal"

interface Message {
  _id: string
  senderName: string
  senderEmail: string
  subject: string
  content: string
  propertyTitle?: string
  status: "unread" | "read" | "replied"
  createdAt: string
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const { toast } = useToast()
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean
    type: "success" | "error"
    title: string
    message: string
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  })

  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      fetchMessages()
    }
  }, [token])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data = await res.json()
      setMessages(data)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status: "read" }),
      })

      if (!res.ok) throw new Error("Failed to update message")

      setMessages(messages.map(m => 
        m._id === id ? { ...m, status: "read" } : m
      ))
      
      setStatusModal({
        isOpen: true,
        type: "success",
        title: "Message Updated",
        message: "Message marked as read",
      })
    } catch (error) {
      setStatusModal({
        isOpen: true,
        type: "error",
        title: "Update Failed",
        message: "Failed to update message status",
      })
    }
  }

  const filteredMessages = messages.filter(msg => 
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.senderEmail.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Manage inquiries and communications</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-md shadow-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading messages...
                  </TableCell>
                </TableRow>
              ) : filteredMessages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No messages found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMessages.map((msg) => (
                  <TableRow key={msg._id}>
                    <TableCell>
                      <div className="font-medium">{msg.senderName}</div>
                      <div className="text-xs text-muted-foreground">{msg.senderEmail}</div>
                    </TableCell>
                    <TableCell>{msg.subject}</TableCell>
                    <TableCell>{msg.propertyTitle || "—"}</TableCell>
                    <TableCell>{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={msg.status === "unread" ? "destructive" : "secondary"}>
                        {msg.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedMessage(msg)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-semibold">From:</span> {selectedMessage?.senderName}
                                </div>
                                <div>
                                  <span className="font-semibold">Email:</span> {selectedMessage?.senderEmail}
                                </div>
                                <div>
                                  <span className="font-semibold">Date:</span> {selectedMessage && new Date(selectedMessage.createdAt).toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-semibold">Property:</span> {selectedMessage?.propertyTitle || "N/A"}
                                </div>
                              </div>
                              <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                                {selectedMessage?.content}
                              </div>
                              <div className="flex justify-end gap-2">
                                {selectedMessage?.status === "unread" && (
                                  <Button onClick={() => selectedMessage && handleMarkAsRead(selectedMessage._id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Read
                                  </Button>
                                )}
                                <Button variant="outline" onClick={() => window.location.href = `mailto:${selectedMessage?.senderEmail}`}>
                                  <Reply className="h-4 w-4 mr-2" />
                                  Reply via Email
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal(prev => ({ ...prev, isOpen: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </div>
  )
}
