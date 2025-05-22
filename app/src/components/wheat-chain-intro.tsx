"use client"

import { Wheat } from "lucide-react"
import styles from "./wheat-chain-intro.module.css"

export function WheatChainIntro() {
  return (
    <div className={styles.introContainer}>
      <div className={styles.logoContainer}>
        
        <h1 className={styles.title}>WheatChain</h1>
      </div>

      <p className={styles.description}>The next generation decentralized token exchange on the Sui blockchain</p>

      <div className={styles.featuresContainer}>
      

        <div className={styles.feature}>
          <div className={styles.featureIcon}>🔒</div>
          <div className={styles.featureText}>
            <h3>Secure</h3>
            <p>Built on Sui's secure Move-based smart contracts</p>
          </div>
        </div>

    
      </div>
    </div>
  )
}
