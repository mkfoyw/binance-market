import { TokenMetadata } from "./crypto";

export interface AlphaToken {
  tokenId: string;
  chainId: string;
  chainIconUrl: string;
  chainName: string;
  contractAddress: string;
  name: string;
  symbol: string;
  iconUrl: string;
  price: string;
  percentChange24h: string;
  volume24h: string;
  marketCap: string;
  fdv: string;
  liquidity: string;
  totalSupply: string;
  circulatingSupply: string;
  holders: string;
  decimals: number;
  listingCex: boolean;
  hotTag: boolean;
  cexCoinName: string;
  canTransfer: boolean;
  denomination: number;
  offline: boolean;
  tradeDecimal: number;
  alphaId: string;
  offsell: boolean;
  priceHigh24h: string;
  priceLow24h: string;
  count24h: string;
  onlineTge: boolean;
  onlineAirdrop: boolean;
  score: number;
  cexOffDisplay: boolean;
  stockState: boolean;
  listingTime: number;
  mulPoint: number;
  bnExclusiveState: boolean;
  updatedAt?: number; // 添加更新时间字段（可选）
}

// 包含 token 和 metadata 的组合数据
export interface BinanceAlphaTokenWithMetadata {
  alphaToken: AlphaToken;
  tokenMetadata: TokenMetadata | null;
}


// 包含 metadata 的响应
export interface BinanceAlphaResponse {
  count: number;
  data: BinanceAlphaTokenWithMetadata[];
}
