"use client";

import { useState } from "react";
import { useSuiClientQuery } from "@mysten/dapp-kit";
import { AdminHeader } from "./admin-header";
import { AdminStats } from "./admin-stats";
import { AdminTabs } from "./admin-tabs";
import { FeeManagement } from "./fee-management";
import { LiquidityManagement } from "./liquidity-management";
import { FeeWithdrawal } from "./fee-withdrawal";
import {
  SWAP_POOL_ID,
  FEE_COLLECTOR_ID,
} from "@/constants/contracts";
import { formatBalance } from "@/utils/formatters";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("fees");

  // Query the swap pool object for balances and fee
  const { data: poolObj, isLoading: poolLoading, refetch: refetchPool } = useSuiClientQuery(
    "getObject",
    { id: SWAP_POOL_ID, options: { showContent: true } },
    { enabled: !!SWAP_POOL_ID }
  );

  // Query the fee collector object for collected fees
  const { data: feeCollectorObj, isLoading: feeCollectorLoading, refetch: refetchFeeCollector } = useSuiClientQuery(
    "getObject",
    { id: FEE_COLLECTOR_ID, options: { showContent: true } },
    { enabled: !!FEE_COLLECTOR_ID }
  );

  // Extract fields from on-chain objects
  const coinABalance = poolObj?.data?.content?.fields?.coin_a_balance ?? "0";
  const coinBBalance = poolObj?.data?.content?.fields?.coin_b_balance ?? "0";
  const swapFee = poolObj?.data?.content?.fields?.fee ?? "0";
  const collectedFees = feeCollectorObj?.data?.content?.fields?.collected_fees ?? "0";

  const isLoading = poolLoading || feeCollectorLoading;

  // Unified refresh function for all stats
  const refreshStats = () => {
    refetchPool();
    refetchFeeCollector();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <AdminStats
          coinABalance={formatBalance(coinABalance)}
          coinBBalance={formatBalance(coinBBalance)}
          swapFee={formatBalance(swapFee)}
          collectedFees={formatBalance(collectedFees)}
          isLoading={isLoading}
        />

        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="mt-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          {activeTab === "fees" && (
            <FeeManagement
              currentFee={swapFee}
              refreshStats={refreshStats}
            />
          )}

          {activeTab === "liquidity" && (
            <LiquidityManagement
              coinABalance={coinABalance}
              coinBBalance={coinBBalance}
              refreshStats={refreshStats}
            />
          )}

          {activeTab === "withdraw" && (
            <FeeWithdrawal
              collectedFees={collectedFees}
              refreshStats={refreshStats}
            />
          )}
        </div>
      </main>
    </div>
  );
}
