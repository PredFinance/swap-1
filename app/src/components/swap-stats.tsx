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

export function SwapStats({ coinABalance, coinBBalance, coinASymbol, coinBSymbol }: SwapStatsProps) {
  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.statsTitle}>Your Portfolio</h2>

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
        <span className={styles.statLabel}>Exchange Rate:</span>
        <span className={styles.statValue}>
          1 {coinASymbol} = 1 {coinBSymbol}
        </span>
      </div>

      <div className={styles.infoBox}>
        <p>WheatChain provides seamless token swaps with real-time execution on the Sui blockchain.</p>
      </div>
    </div>
  )
}
