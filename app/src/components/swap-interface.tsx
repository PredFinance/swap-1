"use client"

import { useState } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClientQuery } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import toast from "react-hot-toast"
import { SwapForm } from "./swap-form"
import { formatBalance } from "@/utils/formatters"
import { SWHIT_A_TYPE } from "@/constants/contracts"
import styles from "./swap-interface.module.css"

// Set your admin address here:
const ADMIN_ADDRESS = "0xREPLACE_WITH_ADMIN_ADDRESS"

function getFeeForAmount(amount: number): number {
  if (amount >= 100 && amount < 50_000) return 0.5
  if (amount >= 50_000 && amount < 100_000) return 0.6
  if (amount >= 100_000 && amount < 500_000) return 0.7
  if (amount >= 500_000 && amount < 1_000_000) return 0.8
  if (amount >= 1_000_000 && amount < 10_000_000) return 1
  if (amount >= 10_000_000 && amount < 50_000_000) return 10
  if (amount >= 50_000_000 && amount < 100_000_000) return 20
  if (amount >= 100_000_000 && amount < 500_000_000) return 50
  return 0
}

export function SwapInterface() {
  const currentAccount = useCurrentAccount()
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [transactionStatus, setTransactionStatus] = useState<string>("")

  const { data: coinABalance, refetch: refetchCoinA } = useSuiClientQuery(
    "getBalance",
    {
      owner: currentAccount?.address || "",
      coinType: SWHIT_A_TYPE,
    },
    {
      enabled: !!currentAccount,
    },
  )

  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const handleSwap = async () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet")
      return
    }
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount")
      return
    }

    const amountNum = Number(amount)
    if (amountNum < 100) {
      toast.error("Minimum swap amount is 100 SWHIT")
      return
    }

    const fee = getFeeForAmount(amountNum)
    if (fee === 0) {
      toast.error("Amount is out of allowed range")
      return
    }

    setIsLoading(true)
    setTransactionStatus("Preparing transaction...")

    try {
      // Get user's SWHIT A coins
      const suiClient = window.suiClient // or use your own client instance
      const { data: coins } = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: SWHIT_A_TYPE,
      })

      if (!coins.length) {
        toast.error("No SWHIT tokens found in wallet")
        setIsLoading(false)
        setTransactionStatus("")
        return
      }

      // Select enough coins
      const selectedCoins = []
      let runningTotal = 0n
      const amountInMist = BigInt(Math.floor(amountNum * Number(MIST_PER_SUI)))
      for (const coin of coins) {
        selectedCoins.push(coin)
        runningTotal += BigInt(coin.balance)
        if (runningTotal >= amountInMist) break
      }

      if (runningTotal < amountInMist) {
        toast.error(`Insufficient SWHIT balance. You need at least ${amount} SWHIT.`)
        setIsLoading(false)
        setTransactionStatus("")
        return
      }

      // Build transaction
      const tx = new Transaction()
      tx.setSender(currentAccount.address)
      tx.setGasBudget(20_000_000)

      // Merge coins if needed
      let inputCoin
      if (selectedCoins.length === 1) {
        inputCoin = tx.object(selectedCoins[0].coinObjectId)
      } else {
        inputCoin = tx.object(selectedCoins[0].coinObjectId)
        const coinsToMerge = selectedCoins.slice(1).map((c) => tx.object(c.coinObjectId))
        tx.mergeCoins(inputCoin, coinsToMerge)
      }

      // Split exact amount of SWHIT to send
      let swapCoin
      if (runningTotal > amountInMist) {
        ;[swapCoin] = tx.splitCoins(inputCoin, [tx.pure.u64(amountInMist)])
      } else {
        swapCoin = inputCoin
      }

      // Transfer SWHIT to admin
      tx.transferObjects([swapCoin], tx.pure.address(ADMIN_ADDRESS))

      // Split SUI fee from gas coin and transfer to admin
      const feeInMist = BigInt(Math.floor(fee * Number(MIST_PER_SUI)))
      const [feeCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(feeInMist)])
      tx.transferObjects([feeCoin], tx.pure.address(ADMIN_ADDRESS))

      setTransactionStatus("Signing and executing transaction...")

      signAndExecute(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: async (result) => {
            toast.success("Tokens and fee sent to admin!")
            setTransactionStatus("")
            setAmount("")
            refetchCoinA()
          },
          onError: (error) => {
            toast.error(`Transaction failed: ${error.message}`)
            setTransactionStatus("")
          },
        },
      )
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      setTransactionStatus("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.swapContainer}>
      <h1 className={styles.title}>Swap Tokens</h1>
      <SwapForm
        amount={amount}
        setAmount={setAmount}
        estimatedOutput={""}
        onSwap={handleSwap}
        isLoading={isLoading}
        isConnected={!!currentAccount}
        isLargeSwap={false}
        coinASymbol="SWHIT"
        coinBSymbol=""
        transactionStatus={transactionStatus}
      />
      {currentAccount && (
        <div style={{ marginTop: 24 }}>
          <div>
            <strong>Your SWHIT Balance:</strong> {formatBalance(coinABalance?.totalBalance || "0")}
          </div>
          <div>
            <strong>Fee for this swap:</strong> {getFeeForAmount(Number(amount) || 0)} SUI
          </div>
        </div>
      )}
    </div>
  )
}
