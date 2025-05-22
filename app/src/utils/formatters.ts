import { MIST_PER_SUI } from "@mysten/sui/utils"

export const formatBalance = (balance: string): string => {
  const balanceInSui = Number(balance) / Number(MIST_PER_SUI)
  return balanceInSui.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

export const truncateAddress = (address: string): string => {
  if (!address) return ""
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
