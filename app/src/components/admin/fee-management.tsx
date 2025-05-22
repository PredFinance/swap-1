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
  SWAP_POOL_ID,
  ADMIN_CAP_ID,
  SWHIT_A_TYPE,
  SWHIT_B_TYPE,
} from "@/constants/contracts";

interface FeeManagementProps {
  currentFee: string;
  refreshStats: () => void;
}

export function FeeManagement({ currentFee, refreshStats }: FeeManagementProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [newFee, setNewFee] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const currentFeeInSui = Number(currentFee) / Number(MIST_PER_SUI);

  const handleUpdateFee = async () => {
    if (!currentAccount || !newFee || isNaN(Number(newFee))) {
      toast.error("Please enter a valid fee amount");
      return;
    }

    const feeInMist = Math.floor(Number(newFee) * Number(MIST_PER_SUI));
    if (feeInMist > 10 * Number(MIST_PER_SUI)) {
      toast.error("Fee cannot exceed 10 SUI");
      return;
    }

    setIsUpdating(true);

    try {
      const tx = new Transaction();
      tx.moveCall({
        target: `${PACKAGE_ID}::swap::update_swap_fee`,
        arguments: [
          tx.object(SWAP_POOL_ID),
          tx.object(ADMIN_CAP_ID),
          tx.pure.u64(feeInMist),
        ],
        typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
      });

      const result = await signAndExecute({
        transaction: tx,
        options: { showEffects: true },
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      toast.success("Swap fee updated successfully!");
      setNewFee("");
      refreshStats();
    } catch (error) {
      toast.error(
        `Fee update failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Fee Management</h2>

      <div className="mb-8">
        <div className="bg-gray-700 p-4 rounded-lg mb-6">
          <p className="text-gray-300 mb-2">Current Swap Fee</p>
          <p className="text-2xl font-bold text-white">
            {currentFeeInSui.toFixed(9)} SUI
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="newFee"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              New Swap Fee (in SUI)
            </label>
            <input
              id="newFee"
              type="number"
              value={newFee}
              onChange={(e) => setNewFee(e.target.value)}
              placeholder="0.0"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              step="0.000000001"
              min="0"
              max="10"
            />
            <p className="text-xs text-gray-400 mt-1">Maximum fee: 10 SUI</p>
          </div>

          <button
            onClick={handleUpdateFee}
            disabled={isUpdating || !newFee}
            className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            {isUpdating ? "Updating..." : "Update Swap Fee"}
          </button>
        </div>
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Fee Information</h3>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
          <li>Standard swap fee is applied to all swaps up to 100,000 tokens</li>
          <li>Large swaps (over 100,000 tokens) have a fixed fee of 10 SUI</li>
          <li>
            Fees are collected in the fee collector and can be withdrawn by the
            admin
          </li>
        </ul>
      </div>
    </div>
  );
}
