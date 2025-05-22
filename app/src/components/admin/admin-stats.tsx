"use client"

import type React from "react"

import { Coins, ArrowRightLeft, Wallet } from "lucide-react"

interface AdminStatsProps {
  coinABalance: string
  coinBBalance: string
  swapFee: string
  collectedFees: string
  isLoading: boolean
}

export function AdminStats({ coinABalance, coinBBalance, swapFee, collectedFees, isLoading }: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="SWHIT A Balance"
        value={coinABalance}
        icon={<Coins className="w-6 h-6 text-blue-400" />}
        isLoading={isLoading}
      />
      <StatCard
        title="SWHIT B Balance"
        value={coinBBalance}
        icon={<Coins className="w-6 h-6 text-purple-400" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Swap Fee"
        value={`${swapFee} SUI`}
        icon={<ArrowRightLeft className="w-6 h-6 text-green-400" />}
        isLoading={isLoading}
      />
      <StatCard
        title="Collected Fees"
        value={`${collectedFees} SUI`}
        icon={<Wallet className="w-6 h-6 text-yellow-400" />}
        isLoading={isLoading}
      />
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  isLoading: boolean
}

function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          {isLoading ? (
            <div className="h-7 w-24 bg-gray-700 animate-pulse rounded"></div>
          ) : (
            <p className="text-xl font-semibold text-white">{value}</p>
          )}
        </div>
        <div className="p-2 bg-gray-700 rounded-lg">{icon}</div>
      </div>
    </div>
  )
}
