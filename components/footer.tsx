import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-4">
              <Image src="/logo.png" alt="SmartReal Logo" width={200} height={60} className="h-8 sm:h-14 w-auto object-contain" />
            </div>
            <p className="text-sm text-gray-700 font-medium">Global real estate automation platform powered by AI.</p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Buy Properties
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Sell Properties
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Rent Properties
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Invest
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-700 hover:text-foreground font-medium">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <Mail className="h-4 w-4" /> support@realconnect.com
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <Phone className="h-4 w-4" /> +2 (349) 01385-70022
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <Phone className="h-4 w-4" /> +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-gray-700 font-medium">
                <MapPin className="h-4 w-4" /> Global
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-gray-400 opacity-30" />

        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-700 font-medium">
          <p className="text-center md:text-left">&copy; 2025 SmartReal. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 md:mt-0 text-xs sm:text-sm">
            <Link href="#" className="hover:text-foreground whitespace-nowrap font-medium">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground whitespace-nowrap font-medium">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-foreground whitespace-nowrap font-medium">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
