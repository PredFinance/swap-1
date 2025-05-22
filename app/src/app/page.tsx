"use client"

import { WalletConnection } from "@/components/wallet-connection"
import { SwapInterface } from "@/components/swap-interface"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <WalletConnection />
      <div className="flex-1 flex items-center justify-center p-4">
        <SwapInterface />
      </div>
    </div>
  )
}
