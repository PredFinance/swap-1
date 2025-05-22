"use client"

import { ArrowDown } from "lucide-react"
import styles from "./swap-form.module.css"

interface SwapFormProps {
  amount: string
  setAmount: (amount: string) => void
  estimatedOutput: string
  onSwap: () => void
  isLoading: boolean
  isConnected: boolean
  isLargeSwap: boolean
  coinASymbol: string
  coinBSymbol: string
  transactionStatus: string
}

export function SwapForm({
  amount,
  setAmount,
  estimatedOutput,
  onSwap,
  isLoading,
  isConnected,
  isLargeSwap,
  coinASymbol,
  coinBSymbol,
  transactionStatus,
}: SwapFormProps) {
  return (
    <div className={styles.formContainer}>
      <div className={styles.inputGroup}>
        <label htmlFor="amount" className={styles.label}>
          From ({coinASymbol})
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className={styles.input}
            disabled={!isConnected || isLoading}
          />
          <div className={styles.tokenBadge}>{coinASymbol}</div>
        </div>
      </div>

      <div className={styles.arrowContainer}>
        <ArrowDown className={styles.arrowIcon} />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="output" className={styles.label}>
          To ({coinBSymbol})
        </label>
        <div className={styles.inputWrapper}>
          <input id="output" type="text" value={estimatedOutput} readOnly className={styles.input} placeholder="0.0" />
          <div className={styles.tokenBadge}>{coinBSymbol}</div>
        </div>
      </div>

      {transactionStatus && (
        <div className={styles.statusBox}>
          <p>{transactionStatus}</p>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}

      <button
        className={styles.swapButton}
        onClick={onSwap}
        disabled={!isConnected || isLoading || !amount || Number.parseFloat(amount) <= 0}
      >
        {!isConnected ? "Connect Wallet" : isLoading ? "Swapping..." : "Swap"}
      </button>
    </div>
  )
}
