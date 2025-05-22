"use client"

import { useCurrentAccount } from "@mysten/dapp-kit"
import { truncateAddress } from "@/utils/formatters"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export function AdminHeader() {
  const currentAccount = useCurrentAccount()

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-yellow-500">Swap Admin Panel</h1>
            <Link href="/" className="flex items-center text-gray-400 hover:text-yellow-500 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Swap
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
              Admin: {currentAccount ? truncateAddress(currentAccount.address) : "Not connected"}
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>
    </header>
  )
}
