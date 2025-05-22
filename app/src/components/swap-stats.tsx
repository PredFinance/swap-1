"use client"

import styles from "./swap-stats.module.css"

interface SwapStatsProps {
  coinABalance: string
  coinBBalance: string
  coinASymbol: string
  coinBSymbol: string
  swapFee: string
  largeSwapFee: string
  currentFee: string
  isLargeSwap: boolean
}

export function SwapStats({
  coinABalance,
  coinBBalance,
  coinASymbol,
  coinBSymbol,
  swapFee,
  largeSwapFee,
  currentFee,
  isLargeSwap,
}: SwapStatsProps) {
  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>Swap Information</h2>

      <div className={styles.statRow}>
        <span className={styles.statLabel}>Your Balance:</span>
        <div className={styles.balances}>
          <div className={styles.balance}>
            <span>{coinABalance}</span>
            <span className={styles.symbol}>{coinASymbol}</span>
          </div>
          <div className={styles.balance}>
            <span>{coinBBalance}</span>
            <span className={styles.symbol}>{coinBSymbol}</span>
          </div>
        </div>
      </div>

      <div className={styles.statRow}>
        <span className={styles.statLabel}>Standard Swap Fee:</span>
        <span className={styles.statValue}>{swapFee}</span>
      </div>

      <div className={styles.statRow}>
        <span className={styles.statLabel}>Large Swap Fee:</span>
        <span className={styles.statValue}>{largeSwapFee}</span>
      </div>

      <div className={styles.statRow}>
        <span className={styles.statLabel}>Current Fee:</span>
        <span className={`${styles.statValue} ${isLargeSwap ? styles.highlightedFee : ""}`}>{currentFee}</span>
      </div>

      <div className={styles.statRow}>
        <span className={styles.statLabel}>Exchange Rate:</span>
        <span className={styles.statValue}>
          1 {coinASymbol} = 1 {coinBSymbol}
        </span>
      </div>

      <div className={styles.infoBox}>
        <p>
          Note: For amounts up to 100k tokens, conversion is 1:1. For amounts over 100k, you will only receive 100k
          tokens and pay a higher fee (10 SUI).
        </p>
      </div>
    </div>
  )
}
