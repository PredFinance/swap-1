import type React from "react"
import type { Metadata } from "next"
import { Providers } from "@/components/providers"
import { ToastProvider } from "@/components/toast-provider"
import { Poetsen_One } from "next/font/google"
import "./globals.css"

const poetsenOne = Poetsen_One({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poetsen-one",
})

export const metadata: Metadata = {
  title: "WheatChain - Decentralized Token Swap",
  description: "Swap your SWHIT tokens on the WheatChain decentralized exchange",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={poetsenOne.variable}>
      <body>
        <Providers>
          <ToastProvider />
          <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
