"use client"

import { WalletConnection } from "@/components/wallet-connection"
import { SwapInterface } from "@/components/swap-interface"
import { WheatChainIntro } from "@/components/wheat-chain-intro"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <WalletConnection />
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <WheatChainIntro />
        <SwapInterface />
      </div>
    </div>
  )
}
