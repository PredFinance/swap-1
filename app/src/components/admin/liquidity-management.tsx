"use client";

import { useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
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
import { formatBalance } from "@/utils/formatters";

interface LiquidityManagementProps {
  coinABalance: string;
  coinBBalance: string;
  refreshStats: () => void;
}

export function LiquidityManagement({
  coinABalance,
  coinBBalance,
  refreshStats,
}: LiquidityManagementProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<"A" | "B">("B");
  const [selectedAction, setSelectedAction] = useState<"deposit" | "withdraw">("deposit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCoinId, setSelectedCoinId] = useState("");

  // Query user's coin balances
  const { data: userCoinsA, refetch: refetchCoinsA } = useSuiClientQuery(
    "getCoins",
    {
      owner: currentAccount?.address || "",
      coinType: SWHIT_A_TYPE,
    },
    {
      enabled: !!currentAccount && selectedCoin === "A" && selectedAction === "deposit",
    }
  );

  const { data: userCoinsB, refetch: refetchCoinsB } = useSuiClientQuery(
    "getCoins",
    {
      owner: currentAccount?.address || "",
      coinType: SWHIT_B_TYPE,
    },
    {
      enabled: !!currentAccount && selectedCoin === "B" && selectedAction === "deposit",
    }
  );

  // Format balances
  const poolCoinABalance = formatBalance(coinABalance);
  const poolCoinBBalance = formatBalance(coinBBalance);

  // Handle deposit
  const handleDeposit = async () => {
    if (!currentAccount || !depositAmount || isNaN(Number(depositAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedCoinId) {
      toast.error(`Please select a SWHIT ${selectedCoin} coin to deposit`);
      return;
    }

    setIsProcessing(true);

    try {
      const amountInMist = Math.floor(Number(depositAmount) * Number(MIST_PER_SUI));
      const tx = new Transaction();

      if (selectedCoin === "A") {
        toast.error("Depositing Coin A is not supported in the current contract");
        return;
      } else {
        tx.moveCall({
          target: `${PACKAGE_ID}::swap::admin_deposit_amount_coin_b`,
          arguments: [
            tx.object(SWAP_POOL_ID),
            tx.object(ADMIN_CAP_ID),
            tx.object(selectedCoinId),
            tx.pure.u64(amountInMist),
          ],
          typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
        });
      }

      const result = await signAndExecute({
        transaction: tx,
        options: { showEffects: true },
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      toast.success(`Successfully deposited ${depositAmount} SWHIT ${selectedCoin}!`);
      setDepositAmount("");
      setSelectedCoinId("");
      refreshStats();
      if (selectedCoin === "A") {
        refetchCoinsA();
      } else {
        refetchCoinsB();
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error(
        `Deposit failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!currentAccount || !withdrawAmount || isNaN(Number(withdrawAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);

    try {
      const amountInMist = Math.floor(Number(withdrawAmount) * Number(MIST_PER_SUI));
      const tx = new Transaction();

      if (selectedCoin === "A") {
        tx.moveCall({
          target: `${PACKAGE_ID}::swap::admin_withdraw_coin_a`,
          arguments: [
            tx.object(SWAP_POOL_ID),
            tx.object(ADMIN_CAP_ID),
            tx.pure.u64(amountInMist),
          ],
          typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
        });
      } else {
        tx.moveCall({
          target: `${PACKAGE_ID}::swap::admin_withdraw_coin_b`,
          arguments: [
            tx.object(SWAP_POOL_ID),
            tx.object(ADMIN_CAP_ID),
            tx.pure.u64(amountInMist),
          ],
          typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
        });
      }

      const result = await signAndExecute({
        transaction: tx,
        options: { showEffects: true },
      });

      await suiClient.waitForTransaction({ digest: result.digest });

      toast.success(`Successfully withdrew ${withdrawAmount} SWHIT ${selectedCoin}!`);
      setWithdrawAmount("");
      refreshStats();
    } catch (error) {
      console.error("Withdraw failed:", error);
      toast.error(
        `Withdraw failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Liquidity Management</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-300 mb-2">SWHIT A Pool Balance</p>
          <p className="text-2xl font-bold text-white">{poolCoinABalance}</p>
        </div>

        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-gray-300 mb-2">SWHIT B Pool Balance</p>
          <p className="text-2xl font-bold text-white">{poolCoinBBalance}</p>
        </div>
      </div>

      <div className="bg-gray-700 p-6 rounded-lg mb-8">
        <div className="flex space-x-4 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              selectedAction === "deposit"
                ? "bg-yellow-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
            onClick={() => setSelectedAction("deposit")}
          >
            Deposit
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              selectedAction === "withdraw"
                ? "bg-yellow-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
            onClick={() => setSelectedAction("withdraw")}
          >
            Withdraw
          </button>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              selectedCoin === "A"
                ? "bg-blue-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
            onClick={() => setSelectedCoin("A")}
          >
            SWHIT A
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${
              selectedCoin === "B"
                ? "bg-purple-600 text-white"
                : "bg-gray-600 text-gray-300 hover:bg-gray-500"
            }`}
            onClick={() => setSelectedCoin("B")}
          >
            SWHIT B
          </button>
        </div>

        {selectedAction === "deposit" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="depositAmount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Amount to Deposit
              </label>
              <input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                step="0.000000001"
                min="0"
              />
            </div>

            {(selectedCoin === "A" ? userCoinsA : userCoinsB)?.data?.length > 0 && (
              <div>
                <label
                  htmlFor="coinSelect"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Select Coin
                </label>
                <select
                  id="coinSelect"
                  value={selectedCoinId}
                  onChange={(e) => setSelectedCoinId(e.target.value)}
                  className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select a coin</option>
                  {(selectedCoin === "A" ? userCoinsA : userCoinsB)?.data?.map(
                    (coin) => (
                      <option key={coin.coinObjectId} value={coin.coinObjectId}>
                        {coin.coinObjectId.substring(0, 8)}... -{" "}
                        {formatBalance(coin.balance)}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            <button
              onClick={handleDeposit}
              disabled={isProcessing || !depositAmount || !selectedCoinId}
              className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isProcessing ? "Processing..." : `Deposit SWHIT ${selectedCoin}`}
            </button>
          </div>
        )}

        {selectedAction === "withdraw" && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="withdrawAmount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Amount to Withdraw
              </label>
              <input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.0"
                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                step="0.000000001"
                min="0"
              />
            </div>

            <button
              onClick={handleWithdraw}
              disabled={isProcessing || !withdrawAmount}
              className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              {isProcessing ? "Processing..." : `Withdraw SWHIT ${selectedCoin}`}
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Liquidity Management Information</h3>
        <ul className="list-disc list-inside text-sm text-gray-300 space-y-2">
          <li>As admin, you can deposit SWHIT B tokens to the pool</li>
          <li>You can withdraw both SWHIT A and SWHIT B tokens from the pool</li>
          <li>SWHIT A tokens accumulate in the pool as users swap</li>
          <li>Ensure sufficient liquidity is maintained for user swaps</li>
        </ul>
      </div>
    </div>
  );
}
