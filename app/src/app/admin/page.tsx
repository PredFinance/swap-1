"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit"
import { AdminAuth } from "@/components/admin/admin-auth"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { ADMIN_CAP_ID } from "@/constants/contracts"
import { useRouter } from "next/navigation"

export default function AdminPage() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Check if the current account is the admin
  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentAccount || !suiClient) {
        setIsAdmin(false)
        setIsLoading(false)
        return
      }

      try {
        // Get the admin cap object
        const { data } = await suiClient.getObject({
          id: ADMIN_CAP_ID,
          options: {
            showContent: true,
          },
        })

        // Check if the current account is the admin
        if (data?.content?.dataType === "moveObject") {
          const adminAddress = data.content.fields.admin
          setIsAdmin(currentAccount.address === adminAddress)
        } else {
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [currentAccount, suiClient])

  // Redirect to home if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin && currentAccount) {
      // Only redirect if we've checked and confirmed the user is not an admin
      router.push("/")
    }
  }, [isAdmin, isLoading, currentAccount, router])

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

  if (!isAdmin) {
    return <AdminAuth isConnected={true} />
  }

  return <AdminDashboard />
}
