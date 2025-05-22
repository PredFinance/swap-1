"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { AdminAuth } from "@/components/admin/admin-auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ADMIN_ADDRESS } from "@/constants/contracts" // <-- Define this in your constants
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const currentAccount = useCurrentAccount()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!isLoading && currentAccount && currentAccount.address !== ADMIN_ADDRESS) {
      router.push("/")
    }
  }, [isLoading, currentAccount, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-yellow-500 border-yellow-200 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-white">Verifying admin access...</h2>
        </div>
      </div>
    )
  }

  if (!currentAccount) {
    return <AdminAuth />
  }

  if (currentAccount.address !== ADMIN_ADDRESS) {
    return <AdminAuth isConnected={true} />
  }

  return <AdminDashboard />
}
