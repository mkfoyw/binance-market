// 价格百分比变化数据
export interface PricePercentage {
  period: number;
  price: number;
  percentage: number;
}

// 价格数据
export interface PriceData {
  source: "binance" | "okx" | "gate" | "dexscreener";
  quoteSymbol: string;
  baseSymbol: string;
  price: number;
  time: number; // Unix 时间戳
  percentages: Record<string, PricePercentage>;
}

// 代币元数据
export interface TokenMetadata {
  id: string;
  source: "binance" | "okx" | "gate" | "dexscreener";
  symbol: string;
  chain: string;
  contractAddress: string;
  poolAddress: string;
  category: string;
  tags: string[];
  maxSupply: number;
  circulatingSupply: number;
  coingeckoId?: string;
  coinmarketcapId?: number;
  coinmarketcapSlug?: string;
  updatedAt: number;
}

// 价格数据详情（组合价格数据和代币元数据）
export interface PriceDataDetail {
  priceData: PriceData;
  tokenMetadata?: TokenMetadata;
}

// 价格数据响应
export interface PriceDataResponse {
  data: PriceDataDetail[];
  count: number;
}


// 错误响应
export interface ErrorResponse {
  error: string;
  valid_sources?: string[];
}

// 健康检查响应
export interface HealthResponse {
  status: string;
  message: string;
}

// 支持的数据源
export const SUPPORTED_SOURCES = ["binance", "okx", "gate", "dexscreener"] as const;
export type SupportedSource = typeof SUPPORTED_SOURCES[number];

// 默认标签列表（优先显示）
export const DEFAULT_TAGS= ["main", "watch", "btc", "eth", "sol", "bnb", "cosmos","meme","l1", "l2","ai", "amm", "lending", "lsd","deritives","gaming"]
