"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import toast from "react-hot-toast";
import {
  PACKAGE_ID,
  FEE_COLLECTOR_ID,
  ADMIN_CAP_ID,
} from "@/constants/contracts";

interface FeeWithdrawalProps {
  collectedFees: string;
  refreshStats: () => void;
}

export function FeeWithdrawal({ collectedFees, refreshStats }: FeeWithdrawalProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const collectedFeesInSui = Number(collectedFees) / Number(MIST_PER_SUI);

  const handleWithdrawFees = async () => {
    if (!currentAccount || !withdrawAmount || isNaN(Number(withdrawAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountInMist = Math.floor(Number(withdrawAmount) * Number(MIST_PER_SUI));
    if (amountInMist > Number(collectedFees)) {
      toast.error("Withdrawal amount exceeds collected fees");
      return;
    }

    setIsWithdrawing(true);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::swap::admin_withdraw_fees`,
        arguments: [
          tx.object(FEE_COLLECTOR_ID),
          tx.object(ADMIN_CAP_ID),
          tx.pure.u64(amountInMist),
        ],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: { showEffects: true },
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      toast.success(`Successfully withdrew ${withdrawAmount} SUI!`);
      setWithdrawAmount("");
      refreshStats();
    } catch (error) {
      toast.error(
        `Fee withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleWithdrawAllFees = async () => {
    if (!currentAccount || Number(collectedFees) <= 0) {
      toast.error("No fees to withdraw");
      return;
    }

    setIsWithdrawing(true);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::swap::admin_withdraw_all_fees`,
        arguments: [tx.object(FEE_COLLECTOR_ID), tx.object(ADMIN_CAP_ID)],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: { showEffects: true },
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      toast.success(
        `Successfully withdrew all collected fees (${collectedFeesInSui.toFixed(9)} SUI)!`
      );
      refreshStats();
    } catch (error) {
      toast.error(
        `Fee withdrawal failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Fee Withdrawal</h2>

      <div className="mb-8">
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <p className="text-gray-300 mb-2">Total Collected Fees</p>
          <p className="text-2xl font-bold text-white">
            {collectedFeesInSui.toFixed(9)} SUI
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="withdrawAmount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Amount to Withdraw (in SUI)
            </label>
            <input
              id="withdrawAmount"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.0"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              step="0.000000001"
              min="0"
              max={collectedFeesInSui}
            />
            <p className="text-xs text-gray-400 mt-1">
              Maximum: {collectedFeesInSui.toFixed(9)} SUI
            </p>
          </div>

          <button
            onClick={handleWithdrawFees}
            disabled={
              isWithdrawing ||
              !withdrawAmount ||
              Number(withdrawAmount) <= 0 ||
              Number(withdrawAmount) > collectedFeesInSui
            }
            className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isWithdrawing ? "Withdrawing..." : "Withdraw Fees"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">Or</span>
            </div>
          </div>

          <button
            onClick={handleWithdrawAllFees}
            disabled={isWithdrawing || Number(collectedFees) <= 0}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isWithdrawing ? "Withdrawing..." : "Withdraw All Fees"}
          </button>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Fee Withdrawal Information</h3>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
          <li>Fees are collected in SUI from all swap transactions</li>
          <li>Standard swaps pay the configured fee amount</li>
          <li>Large swaps (over 100,000 tokens) pay a fixed fee of 10 SUI</li>
          <li>Only the admin can withdraw collected fees</li>
        </ul>
      </div>
    </div>
  );
}
