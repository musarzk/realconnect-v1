"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { StatusModal } from "@/components/status-modal"

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [modalState, setModalState] = useState<{
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setModalState({
        isOpen: true,
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      setModalState({
        isOpen: true,
        type: "success",
        title: "Message Sent!",
        message: "We received your message and will get back to you soon!",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("[v0] Form submission error:", error)
      setModalState({
        isOpen: true,
        type: "error",
        title: "Submission Failed",
        message: "Failed to submit form. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Send us an email",
      value: "support@smartreal.com",
      link: "mailto:support@realconnect.com",
    },
    {
      icon: Phone,
      title: "Phone",
      description: "Call us directly",
      value: "+234 9138570022",
      link: "tel:+2349138570022",
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our office",
      value: "22, Cadatrial zone, off Aminu Kano, Abuja",
      link: "#",
    },
    {
      icon: MapPin,
      title: "Office",
      description: "Visit our office",
      value: "Hamonde Ave, NYC 10001",
      link: "#",
    },
  ]

  const subjects = [
    "General Inquiry",
    "List a Property",
    "Investment Question",
    "Technical Support",
    "Partnership Opportunity",
    "Other",
  ]

  return (
    <div className="min-h-screen ">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We&apos;d love to hear from you. Our team is here to help and respond to inquiries within 24
            hours.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <a key={index} href={method.link} className="group">
                <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full cursor-pointer">
                  <method.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold mb-2">{method.title}</h3>
                  <p className="text-muted-foreground text-sm mb-2">{method.description}</p>
                  <p className="font-medium text-primary">{method.value}</p>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8">
              <form onSubmit={handleSubmit}>
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>

          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: "How long does it take to list a property?",
                a: "Typically, it takes 2-3 business days for our team to review and approve your property listing.",
              },
              {
                q: "What are the fees for listing?",
                a: "We offer flexible pricing plans. Basic listings are free, with premium options available starting at $29/month.",
              },
              {
                q: "How can I become an investor?",
                a: "Visit our Investor Portal to view opportunities. You'll need to create an account and complete our investor verification process.",
              },
              {
                q: "Is my personal information secure?",
                a: "Yes, we use industry-standard encryption and security measures to protect all user data.",
              },
            ].map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-bold mb-3">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      
      <StatusModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        actionLabel={modalState.type === "success" ? "Great!" : "Close"}
      />
    </div>
  )
}
