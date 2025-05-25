"use client"

import { useState, useEffect } from "react"
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient, useSuiClientQuery } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"
import { MIST_PER_SUI } from "@mysten/sui/utils"
import { bcs } from '@mysten/sui/bcs';
import toast from "react-hot-toast"
import { SwapForm } from "./swap-form"
import { SwapStats } from "./swap-stats"
import { formatBalance } from "@/utils/formatters"
import {
  PACKAGE_ID,
  SWAP_POOL_ID,
  FEE_COLLECTOR_ID,
  SWHIT_A_TYPE,
  SWHIT_B_TYPE,
  LARGE_SWAP_THRESHOLD,
  LARGE_SWAP_FEE,
} from "@/constants/contracts"
import styles from "./swap-interface.module.css"

export function SwapInterface() {
  const currentAccount = useCurrentAccount()
  const suiClient = useSuiClient()
  const [amount, setAmount] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [swapFee, setSwapFee] = useState<string>("0.38")
  const [transactionStatus, setTransactionStatus] = useState<string>("")

  // Query balances when account is connected
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

  const { data: coinBBalance, refetch: refetchCoinB } = useSuiClientQuery(
    "getBalance",
    {
      owner: currentAccount?.address || "",
      coinType: SWHIT_B_TYPE,
    },
    {
      enabled: !!currentAccount,
    },
  )

  // Sign and execute transaction hook
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  // Calculate estimated output based on input amount
  const calculateEstimatedOutput = (inputAmount: string): string => {
    if (!inputAmount || isNaN(Number(inputAmount))) return "0"
    const amountValue = Number.parseFloat(inputAmount)
    const amountInMist = Math.floor(amountValue * Number(MIST_PER_SUI))
    if (amountInMist <= LARGE_SWAP_THRESHOLD) {
      return amountValue.toString()
    } else {
      return (LARGE_SWAP_THRESHOLD / Number(MIST_PER_SUI)).toString()
    }
  }

  // Check if the swap would be considered a large swap
  const isLargeSwap = (inputAmount: string): boolean => {
    if (!inputAmount || isNaN(Number(inputAmount))) return false
    const amountValue = Number.parseFloat(inputAmount)
    const amountInMist = Math.floor(amountValue * Number(MIST_PER_SUI))
    return amountInMist > LARGE_SWAP_THRESHOLD
  }

  // Get the fee for the current swap amount
  const getCurrentFee = (): string => {
    if (isLargeSwap(amount)) {
      return (LARGE_SWAP_FEE / Number(MIST_PER_SUI)).toString()
    }
    return swapFee
  }

  // Handle swap execution
const handleSwap = async () => {
  if (!currentAccount || !amount || isNaN(Number(amount))) {
    toast.error("Please enter a valid amount")
    return
  }
  setIsLoading(true)
  setTransactionStatus("Preparing transaction...")

  try {
    const amountInMist = Math.floor(Number.parseFloat(amount) * Number(MIST_PER_SUI))

    // Find Coin A objects
    const { data: coins } = await suiClient.getCoins({
      owner: currentAccount.address,
      coinType: SWHIT_A_TYPE,
    })

    if (!coins.length) {
      toast.error("No SWHIT A tokens found in wallet")
      setIsLoading(false)
      setTransactionStatus("")
      return
    }

    // Select enough coins to cover the amount
    let selectedCoins = []
    let runningTotal = 0n
    for (const coin of coins) {
      selectedCoins.push(coin)
      runningTotal += BigInt(coin.balance)
      if (runningTotal >= BigInt(amountInMist)) break
    }
    if (runningTotal < BigInt(amountInMist)) {
      toast.error(`Insufficient SWHIT A balance. You need at least ${amount} SWHIT A.`)
      setIsLoading(false)
      setTransactionStatus("")
      return
    }

    // Calculate required fee
    const requiredFee = isLargeSwap(amount) ? LARGE_SWAP_FEE : Number(swapFee) * Number(MIST_PER_SUI)

    setTransactionStatus("Building transaction...")

    const tx = new Transaction()
    tx.setSender(currentAccount.address)

    // Merge Coin A if needed
    let inputCoin
    if (selectedCoins.length === 1) {
      inputCoin = tx.object(selectedCoins[0].coinObjectId)
    } else {
      inputCoin = tx.object(selectedCoins[0].coinObjectId)
      const coinsToMerge = selectedCoins.slice(1).map(c => tx.object(c.coinObjectId))
      tx.mergeCoins(inputCoin, coinsToMerge)
    }

    // Split out the exact Coin A amount if needed
    let swapCoin
    if (runningTotal > BigInt(amountInMist)) {
      [swapCoin] = tx.splitCoins(inputCoin, [tx.pure.u64(amountInMist)])
    } else {
      swapCoin = inputCoin
    }

    // 🟢 Split the gas coin for the SUI payment (fee)
    const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(requiredFee)])

    // Add the swap transaction
    tx.moveCall({
      target: `${PACKAGE_ID}::swap::swap`,
      arguments: [
        tx.object(SWAP_POOL_ID),
        tx.object(FEE_COLLECTOR_ID),
        swapCoin,
        paymentCoin, // 🟢 Use the split payment coin
      ],
      typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
    })

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
          setTransactionStatus("Waiting for transaction to finalize...")
          await suiClient.waitForTransaction({ digest: result.digest })
          toast.success("Swap completed successfully!")
          setTransactionStatus("")
          refetchCoinA()
          refetchCoinB()
          setAmount("")
        },
        onError: (error) => {
          toast.error(`Swap failed: ${error.message}`)
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


  // Refresh balances when account changes
  useEffect(() => {
    if (currentAccount) {
      refetchCoinA()
      refetchCoinB()
    }
  }, [currentAccount, refetchCoinA, refetchCoinB])

  // Fetch swap fee directly using the Sui client
  useEffect(() => {
    async function fetchSwapFee() {
      if (!currentAccount || !suiClient) return
      try {
        const txb = new Transaction()
        txb.moveCall({
          target: `${PACKAGE_ID}::swap::get_swap_fee`,
          arguments: [txb.object(SWAP_POOL_ID)],
          typeArguments: [SWHIT_A_TYPE, SWHIT_B_TYPE],
        })
        const result = await suiClient.devInspectTransactionBlock({
          sender: currentAccount.address,
          transactionBlock: txb,
        })
        if (result?.results?.[0]?.returnValues?.[0]) {
          // Correct BCS decoding!
          const feeBytes = result.results[0].returnValues[0][0];
          const feeInMist = bcs.u64().parse(Uint8Array.from(feeBytes));
          const feeInSui = Number(feeInMist) / Number(MIST_PER_SUI)
          setSwapFee(feeInSui.toString())
        }
      } catch (error) {
        console.error("Error fetching swap fee:", error)
      }
    }
    fetchSwapFee()
  }, [currentAccount, suiClient])

  return (
    <div className={styles.swapContainer}>
      <h1 className={styles.title}>Swap Tokens</h1>
      <SwapForm
        amount={amount}
        setAmount={setAmount}
        estimatedOutput={calculateEstimatedOutput(amount)}
        onSwap={handleSwap}
        isLoading={isLoading}
        isConnected={!!currentAccount}
        isLargeSwap={isLargeSwap(amount)}
       coinASymbol="SWHIT Previous"
          coinBSymbol="SWHIT Main"
        transactionStatus={transactionStatus}
      />
      {currentAccount && (
        <SwapStats
          coinABalance={formatBalance(coinABalance?.totalBalance || "0")}
          coinBBalance={formatBalance(coinBBalance?.totalBalance || "0")}
         coinASymbol="SWHIT Previous"
          coinBSymbol="SWHIT Main"
          swapFee={`${swapFee} SUI`}
          largeSwapFee={`${LARGE_SWAP_FEE / Number(MIST_PER_SUI)} SUI`}
          currentFee={`${getCurrentFee()} SUI`}
          isLargeSwap={isLargeSwap(amount)}
        />
      )}
    </div>
  )
}
