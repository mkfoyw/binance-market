import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBinanceFuturesUrl(baseSymbol: string, quoteSymbol: string = 'USDT'): string {
  return `https://www.binance.com/zh-CN/futures/${baseSymbol}${quoteSymbol}`
}

export function getTradingUrl(
  source: string,
  baseSymbol: string,
  quoteSymbol: string = 'USDT'
): string {
  return getBinanceFuturesUrl(baseSymbol, quoteSymbol)
}
