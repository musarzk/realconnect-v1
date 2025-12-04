import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ToastProvider } from "@/components/toast-provider"
import { AuthProvider } from "@/context/auth-context"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Realconnect | Global Real Estate Automation Platform",
  description:
    "Discover properties, invest globally. AI-powered real estate platform connecting sellers, buyers, and investors.",
  

  icons: {
    icon: "/favicon/favicon.png",
    shortcut: "/favicon/favicon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
