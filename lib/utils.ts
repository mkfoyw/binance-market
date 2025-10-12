import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 根据链名称生成区块链浏览器地址
export function getBlockExplorerUrl(chainName: string, contractAddress: string): string | null {
  const chainLower = chainName.toLowerCase();
  
  // 主要区块链浏览器映射
  const explorerMap: Record<string, string> = {
    'ethereum': `https://etherscan.io/token/${contractAddress}`,
    'eth': `https://etherscan.io/token/${contractAddress}`,
    'bsc': `https://bscscan.com/token/${contractAddress}`,
    'bnb chain': `https://bscscan.com/token/${contractAddress}`,
    'bnb': `https://bscscan.com/token/${contractAddress}`,
    'polygon': `https://polygonscan.com/token/${contractAddress}`,
    'matic': `https://polygonscan.com/token/${contractAddress}`,
    'arbitrum': `https://arbiscan.io/token/${contractAddress}`,
    'arb': `https://arbiscan.io/token/${contractAddress}`,
    'optimism': `https://optimistic.etherscan.io/token/${contractAddress}`,
    'op': `https://optimistic.etherscan.io/token/${contractAddress}`,
    'avalanche': `https://snowtrace.io/token/${contractAddress}`,
    'avax': `https://snowtrace.io/token/${contractAddress}`,
    'fantom': `https://ftmscan.com/token/${contractAddress}`,
    'ftm': `https://ftmscan.com/token/${contractAddress}`,
    'solana': `https://solscan.io/token/${contractAddress}`,
    'sol': `https://solscan.io/token/${contractAddress}`,
    'base': `https://basescan.org/token/${contractAddress}`,
    'linea': `https://lineascan.build/token/${contractAddress}`,
    'scroll': `https://scrollscan.com/token/${contractAddress}`,
    'zksync': `https://explorer.zksync.io/address/${contractAddress}`,
    'starknet': `https://starkscan.co/contract/${contractAddress}`,
    'sui': `https://suiscan.xyz/mainnet/object/${contractAddress}`,
    'aptos': `https://explorer.aptoslabs.com/account/${contractAddress}`,
  };
  
  return explorerMap[chainLower] || null;
}


/**
 * 生成币安合约页面URL
 * @param baseSymbol 基础代币符号，如 'BTC'
 * @param quoteSymbol 计价代币符号，如 'USDT'，默认为 'USDT'
 * @returns 币安合约页面URL
 */
export function getBinanceFuturesUrl(baseSymbol: string, quoteSymbol: string = 'USDT'): string {
  return `https://www.binance.com/zh-CN/futures/${baseSymbol}${quoteSymbol}`
}

/**
 * 生成 CoinMarketCap 代币页面 URL
 * @param slug CoinMarketCap slug，如 'bitcoin', 'ethereum'
 * @returns CoinMarketCap 代币页面 URL
 */
export function getCoinMarketCapUrl(slug: string): string {
  return `https://coinmarketcap.com/currencies/${slug}/`
}


/**
 * 生成 CoinGecko 代币页面 URL
 * @param id CoinGecko ID，如 'bitcoin', 'ethereum'
 * @returns CoinGecko 代币页面 URL
 */
export function getCoinGeckoUrl(id: string): string {
  return `https://www.coingecko.com/en/coins/${id}`
}


/**
 * 生成 Gate.io 交易页面 URL
 * @param baseSymbol 基础代币符号，如 'BTC'
 * @param quoteSymbol 计价代币符号，如 'USDT'，默认为 'USDT'
 * @returns Gate.io 交易页面 URL
 */
export function getGateUrl(baseSymbol: string, quoteSymbol: string = 'USDT'): string {
  return `https://www.gate.com/trade/${baseSymbol}_${quoteSymbol}`
}

/**
 * 生成 OKX 交易页面 URL
 * @param baseSymbol 基础代币符号，如 'BTC'
 * @param quoteSymbol 计价代币符号，如 'USDT'，默认为 'USDT'
 * @returns OKX 交易页面 URL
 */
export function getOKXUrl(baseSymbol: string, quoteSymbol: string = 'USDT'): string {
  return `https://www.okx.com/trade-spot/${baseSymbol.toLowerCase()}-${quoteSymbol.toLowerCase()}`
}

/**
 * 生成 DexScreener 页面 URL
 * @param chain 链名称，如 'ethereum', 'bsc'
 * @param contractAddress 合约地址
 * @returns DexScreener 页面 URL
 */
export function getDexScreenerUrl(chain?: string, contractAddress?: string): string {
  if (chain && contractAddress) {
    return `https://dexscreener.com/${chain}/${contractAddress}`
  }
  return 'https://dexscreener.com'
}

/**
 * 根据来源获取交易页面 URL
 * @param source 数据来源，如 'binance', 'gate', 'okx', 'dexscreener'
 * @param baseSymbol 基础代币符号
 * @param quoteSymbol 计价代币符号
 * @param chain 链名称（用于 DexScreener）
 * @param contractAddress 合约地址（用于 DexScreener）
 * @returns 交易页面 URL
 */
export function getTradingUrl(
  source: string,
  baseSymbol: string,
  quoteSymbol: string = 'USDT',
  chain?: string,
  contractAddress?: string
): string {
  switch (source.toLowerCase()) {
    case 'binance':
      return getBinanceFuturesUrl(baseSymbol, quoteSymbol)
    case 'gate':
      return getGateUrl(baseSymbol, quoteSymbol)
    case 'okx':
      return getOKXUrl(baseSymbol, quoteSymbol)
    case 'dexscreener':
      return getDexScreenerUrl(chain, contractAddress)
    default:
      return getBinanceFuturesUrl(baseSymbol, quoteSymbol)
  }
}
