"use client"

import { ConnectButton } from "@mysten/dapp-kit"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface AdminAuthProps {
  isConnected?: boolean
}

export function AdminAuth({ isConnected = false }: AdminAuthProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-500 mb-2">Admin Access</h1>
          <p className="text-gray-400">
            {isConnected
              ? "Your connected wallet does not have admin privileges."
              : "Connect your wallet to access admin features."}
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          {!isConnected && (
            <div className="w-full">
              <div className="flex justify-center">
                <ConnectButton />
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                Please connect with the wallet that holds the admin capability.
              </p>
            </div>
          )}

          {isConnected && (
            <div className="text-center text-red-400">
              <p>Access denied. Only the contract admin can access this page.</p>
              <p className="text-sm mt-2">
                If you believe this is an error, please ensure you're connected with the correct wallet.
              </p>
            </div>
          )}

          <Link href="/" className="flex items-center text-yellow-500 hover:text-yellow-400 transition-colors mt-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return to Swap Interface
          </Link>
        </div>
      </div>
    </div>
  )
}
