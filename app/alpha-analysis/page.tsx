'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlphaToken, BinanceAlphaTokenWithMetadata } from '@/lib/types/binance-alpha';
import { TokenMetadata, DEFAULT_TAGS } from '@/lib/types/crypto';
import { formatLargeNumber, formatPrice, formatPercent, formatDateTime } from '@/lib/format';
import { TrendingUp, TrendingDown, Search, Flame, AlertCircle, RefreshCw, Tag, MoreHorizontal, ExternalLink, ListFilter, Copy, Check, ChevronUp, ChevronDown, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { useGetBinanceAlphaTokensQuery } from '@/lib/services/crypto-price-tracker';
import { Button } from '@/components/ui/button';

// 工具函数
function getCoinMarketCapUrl(slug: string): string {
  return `https://coinmarketcap.com/currencies/${slug}/`;
}
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Normalize a timestamp to milliseconds. API may return seconds or milliseconds.
function toMs(ts?: number | null): number | null {
  if (!ts && ts !== 0) return null;
  const n = Number(ts);
  if (isNaN(n)) return null;
  // If timestamp looks like milliseconds (>= 1e12), return as-is.
  // Otherwise treat as seconds and convert to ms.
  return n > 1e12 ? n : n * 1000;
}

// 根据链名称生成区块链浏览器地址
function getBlockExplorerUrl(chainName: string, contractAddress: string): string | null {
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

// 格式化合约地址，显示前6位和后4位
function formatContractAddress(address: string): string {
  if (!address || address.length < 11) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 代币详细信息 Popover 组件
const TokenDetailPopover = React.memo(function TokenDetailPopover({ 
  token 
}: { 
  token: AlphaToken;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className="relative w-10 h-10 flex-shrink-0 ring-2 ring-muted/50 rounded-full group-hover:ring-primary/50 transition-all cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <img
            src={token.iconUrl}
            alt={token.name}
            className="rounded-full object-cover w-full h-full"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPj88L3RleHQ+PC9zdmc+';
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        align="start"
        side="right"
        className="w-80 p-4"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="space-y-3">
          {/* 头部 */}
          <div className="flex items-center gap-3 border-b pb-3">
            <img
              src={token.iconUrl}
              alt={token.name}
              width={40}
              height={40}
              className="rounded-full"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiPj88L3RleHQ+PC9zdmc+';
              }}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">{token.name}</h3>
              <p className="text-sm text-muted-foreground">{token.symbol}</p>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">合约地址:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-xs cursor-help">
                      {formatContractAddress(token.contractAddress)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{token.contractAddress}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">链:</span>
              <span className="font-medium">{token.chainName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">价格:</span>
              <span className="font-semibold">{formatPrice(token.price)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">24h 涨跌:</span>
              <span className={`font-semibold ${parseFloat(token.percentChange24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(parseFloat(token.percentChange24h))}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">流通市值:</span>
              <span className="font-medium">${formatLargeNumber(token.marketCap)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">全流通市值 (FDV):</span>
              <span className="font-medium">${formatLargeNumber(token.fdv)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">24h 交易量:</span>
              <span className="font-medium">${formatLargeNumber(token.volume24h)}</span>
            </div>

            {token.liquidity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">流动性:</span>
                <span className="font-medium">${formatLargeNumber(token.liquidity)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-muted-foreground">持币地址:</span>
              <span className="font-medium">{formatLargeNumber(token.holders, 0)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">总供应量:</span>
              <span className="font-medium">{formatLargeNumber(token.totalSupply, 0)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">流通供应量:</span>
              <span className="font-medium">{formatLargeNumber(token.circulatingSupply, 0)}</span>
            </div>

            {token.listingTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">上线时间:</span>
                <span className="font-medium text-xs">
                  {toMs(token.listingTime) ? new Date(toMs(token.listingTime) as number).toLocaleString('zh-CN') : '--'}
                </span>
              </div>
            )}
          </div>

          {/* 状态标签 */}
          <div className="flex gap-2 flex-wrap pt-2 border-t">
            {token.hotTag && (
              <Badge className="text-xs bg-orange-500 hover:bg-orange-600 text-white">
                🔥 Hot
              </Badge>
            )}
            {token.listingCex ? (
              <Badge variant="default" className="text-xs">CEX</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">DEX</Badge>
            )}
            {token.offline ? (
              <Badge variant="destructive" className="text-xs">Offline</Badge>
            ) : (
              <Badge variant="outline" className="text-xs border-green-500/50 text-green-600">Online</Badge>
            )}
            {token.onlineTge && <Badge variant="outline" className="text-xs">TGE</Badge>}
            {token.onlineAirdrop && <Badge variant="outline" className="text-xs">Airdrop</Badge>}
            {token.canTransfer && <Badge variant="outline" className="text-xs">可转账</Badge>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

// 悬浮菜单组件
const HoverPopoverMenu = React.memo(function HoverPopoverMenu({ 
  token, 
  metadata 
}: { 
  token: AlphaToken; 
  metadata: TokenMetadata | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  const handleCopyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(token.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [token.contractAddress]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted transition-colors cursor-pointer group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <MoreHorizontal className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        align="end"
        side="left"
        className="w-auto p-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col gap-1">
          {/* 复制合约地址 */}
          <button
            onClick={handleCopyAddress}
            className="flex items-center justify-start gap-2 px-3 py-2 h-auto font-normal text-sm rounded-md hover:bg-muted transition-colors w-full"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-500">已复制</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>复制合约地址</span>
              </>
            )}
          </button>

          {/* Binance 链接 */}
          <a
            href={`https://www.binance.com/zh-CN/alpha/${token.chainName.toLowerCase()}/${token.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-start gap-2 px-3 py-2 h-auto font-normal text-sm rounded-md hover:bg-muted transition-colors w-full"
          >
            <ExternalLink className="h-4 w-4" />
            <span>在 Binance Alpha 上查看</span>
          </a>

          {/* DexScreener 链接 */}
          <a
            href={`https://dexscreener.com/search?q=${token.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-start gap-2 px-3 py-2 h-auto font-normal text-sm rounded-md hover:bg-muted transition-colors w-full"
          >
            <ExternalLink className="h-4 w-4" />
            <span>在 DexScreener 查看</span>
          </a>

          {/* CoinMarketCap 链接 */}
          {metadata?.coinmarketcapSlug && (
            <a
              href={getCoinMarketCapUrl(metadata.coinmarketcapSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-start gap-2 px-3 py-2 h-auto font-normal text-sm rounded-md hover:bg-muted transition-colors w-full"
            >
              <ExternalLink className="h-4 w-4" />
              <span>在 CoinMarketCap 查看</span>
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

// 状态筛选组件（多选：CEX/DEX/Offline/Online）
function StatusFilter({ statusFilter, setStatusFilter }: { statusFilter: string[]; setStatusFilter: (v: string[]) => void }) {
  const options: { key: string; label: string; title?: string }[] = [
    { key: 'cex', label: 'CEX', title: 'CEX 上线代币' },
    { key: 'dex', label: 'DEX', title: 'DEX 代币' },
    { key: 'offline', label: 'Offline', title: '离线代币' },
    { key: 'online', label: 'Online', title: '在线代币' },
  ];

  const handleToggle = (key: string) => {
    if (key === 'all') {
      setStatusFilter([]);
      return;
    }
    setStatusFilter(
      statusFilter.includes(key)
        ? statusFilter.filter(t => t !== key)
        : [...statusFilter, key]
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap" role="tablist" aria-label="状态筛选">
      <Button
        variant={statusFilter.length === 0 ? "default" : "outline"}
        size="sm"
        onClick={() => handleToggle('all')}
        className={`transition-all ${
          statusFilter.length === 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105'
            : 'hover:scale-105'
        }`}
      >
        所有状态
      </Button>
      {options.map((opt) => (
        <Button
          key={opt.key}
          variant={statusFilter.includes(opt.key) ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle(opt.key)}
          title={opt.title}
          aria-pressed={statusFilter.includes(opt.key)}
          className={`transition-all ${
            statusFilter.includes(opt.key)
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105'
              : 'hover:scale-105'
          }`}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// 标签筛选组件
function TagFilter({ 
  tagFilter, 
  setTagFilter, 
  availableTags 
}: { 
  tagFilter: string[]; 
  setTagFilter: (v: string[]) => void;
  availableTags: string[];
}) {
  const handleToggle = (tag: string) => {
    if (tag === 'all') {
      setTagFilter([]);
      return;
    }
    setTagFilter(
      tagFilter.includes(tag)
        ? tagFilter.filter(t => t !== tag)
        : [...tagFilter, tag]
    );
  };

  if (availableTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button
        variant={tagFilter.length === 0 ? "default" : "outline"}
        size="sm"
        onClick={() => handleToggle('all')}
        className={`transition-all ${
          tagFilter.length === 0
            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105'
            : 'hover:scale-105'
        }`}
      >
        所有标签
      </Button>
      {availableTags.map((tag) => (
        <Button
          key={tag}
          variant={tagFilter.includes(tag) ? "default" : "outline"}
          size="sm"
          onClick={() => handleToggle(tag)}
          className={`transition-all ${
            tagFilter.includes(tag)
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105'
              : 'hover:scale-105'
          }`}
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}

export default function BinanceAlphaPage() {
  const { data, isLoading, isError, error, refetch } = useGetBinanceAlphaTokensQuery(undefined, {
    pollingInterval: 30000, // 每30秒自动刷新
  });
  const [filteredTokens, setFilteredTokens] = useState<BinanceAlphaTokenWithMetadata[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'marketCap' | 'percentChange24h' | 'liquidity' | 'volume24h' | 'price' | 'listingTime' | 'holders' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // 状态筛选: 多选数组
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  // 标签筛选: 多选数组
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  // 最后更新时间
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  // 重置按钮动画状态
  const [isResetting, setIsResetting] = useState(false);

  const tokens = Array.isArray(data?.data) ? data.data : [];
  const totalCount = data?.count || 0;

  // 数据更新时，更新最后更新时间
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);

  // 获取所有可用的标签，优先显示 DEFAULT_TAGS
  const availableTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    tokens.forEach(item => {
      if (item.tokenMetadata?.tags) {
        item.tokenMetadata.tags.forEach(tag => tagSet.add(tag));
      }
    });
    const allTags = Array.from(tagSet);
    
    // 分离 DEFAULT_TAGS 和其他标签
    const defaultTagsPresent = DEFAULT_TAGS.filter(tag => allTags.includes(tag as string));
    const otherTags = allTags.filter(tag => !(DEFAULT_TAGS as readonly string[]).includes(tag)).sort();
    
    // DEFAULT_TAGS 在前，其他标签在后
    return [...defaultTagsPresent, ...otherTags];
  }, [tokens]);

  useEffect(() => {
    filterAndSortTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, data, sortBy, sortOrder, statusFilter, tagFilter]);

  const filterAndSortTokens = () => {
    let filtered = tokens;

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter(item => 
        item.alphaToken.name?.toLowerCase().includes(term) ||
        item.alphaToken.symbol?.toLowerCase().includes(term) ||
        item.alphaToken.contractAddress?.toLowerCase().includes(term)
      );
    }

    // 状态筛选：支持组合（AND 逻辑）
    if (statusFilter.length > 0) {
      statusFilter.forEach((status) => {
        if (status === 'cex') {
          filtered = filtered.filter(item => item.alphaToken.listingCex);
        }
        if (status === 'dex') {
          filtered = filtered.filter(item => !item.alphaToken.listingCex);
        }
        if (status === 'offline') {
          filtered = filtered.filter(item => item.alphaToken.offline);
        }
        if (status === 'online') {
          filtered = filtered.filter(item => !item.alphaToken.offline);
        }
      });
    }

    // 标签筛选：代币必须包含所选标签中的至少一个（OR 逻辑）
    if (tagFilter.length > 0) {
      filtered = filtered.filter(item => {
        if (!item.tokenMetadata?.tags || item.tokenMetadata.tags.length === 0) {
          return false;
        }
        // 检查是否有任何选中的标签存在于代币的标签列表中
        return tagFilter.some(selectedTag => 
          item.tokenMetadata!.tags.includes(selectedTag)
        );
      });
    }

    // 排序
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: number, bValue: number;
        const aToken = a.alphaToken;
        const bToken = b.alphaToken;
        
        switch (sortBy) {
          case 'score':
            aValue = aToken.score;
            bValue = bToken.score;
            break;
          case 'marketCap':
            aValue = parseFloat(aToken.marketCap);
            bValue = parseFloat(bToken.marketCap);
            break;
          case 'percentChange24h':
            aValue = parseFloat(aToken.percentChange24h);
            bValue = parseFloat(bToken.percentChange24h);
            break;
          case 'liquidity':
            aValue = parseFloat(aToken.liquidity) || 0;
            bValue = parseFloat(bToken.liquidity) || 0;
            break;
          case 'volume24h':
            aValue = parseFloat(aToken.volume24h);
            bValue = parseFloat(bToken.volume24h);
            break;
          case 'price':
            aValue = parseFloat(aToken.price);
            bValue = parseFloat(bToken.price);
            break;
          case 'listingTime':
            aValue = aToken.listingTime || 0;
            bValue = bToken.listingTime || 0;
            break;
          case 'holders':
            aValue = Number(String(aToken.holders).replace(/\D+/g, '')) || 0;
            bValue = Number(String(bToken.holders).replace(/\D+/g, '')) || 0;
            break;
          default:
            return 0;
        }
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    }

    setFilteredTokens(filtered);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // 获取排序图标
  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  // 重置排序
  const handleReset = () => {
    setIsResetting(true);
    setSortBy(null);
    setSortOrder('desc');
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8 space-y-6 max-w-[1600px]">
          {/* Header Skeleton */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                  <Flame className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Binance Alpha 代币分析
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    正在加载数据...
                  </p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/50 animate-pulse">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-l-4 border-l-primary/20 animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Search and Filters Skeleton */}
          <Card className="shadow-md animate-pulse">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4">
                <div className="h-11 bg-muted rounded-lg"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 bg-muted rounded-lg w-20"></div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token List Skeleton */}
          <Card className="shadow-md">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-background/95 border-b-2 border-primary/20">
                    <tr>
                      <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm">代币</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">价格</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">24h涨跌</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">流动性</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">市值</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm hidden lg:table-cell">24h交易量</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm">持有者</th>
                      <th className="text-right p-3 sm:p-4 font-semibold text-xs sm:text-sm hidden xl:table-cell">上线时间</th>
                      <th className="text-left p-3 sm:p-4 font-semibold text-xs sm:text-sm hidden lg:table-cell">标签</th>
                      <th className="text-center p-3 sm:p-4 font-semibold text-xs sm:text-sm">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <tr key={i} className="border-b animate-pulse">
                        <td className="p-3 sm:p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-32"></div>
                              <div className="h-3 bg-muted rounded w-24"></div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="h-4 bg-muted rounded w-16 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right hidden lg:table-cell">
                          <div className="h-4 bg-muted rounded w-20 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <div className="h-4 bg-muted rounded w-16 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 text-right hidden xl:table-cell">
                          <div className="h-4 bg-muted rounded w-24 ml-auto"></div>
                        </td>
                        <td className="p-3 sm:p-4 hidden lg:table-cell">
                          <div className="flex gap-1">
                            <div className="h-5 bg-muted rounded w-12"></div>
                            <div className="h-5 bg-muted rounded w-12"></div>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="h-8 w-8 bg-muted rounded mx-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-2 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>错误: {error && 'data' in error ? JSON.stringify(error.data) : '加载失败'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-[1600px]">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-primary"  />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Binance Alpha 代币分析
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  Alpha 项目代币分析
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-muted-foreground">
                <div>最后更新</div>
                <div className="font-mono">
                  {lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>
              <button
                onClick={() => {
                  refetch();
                  setLastUpdated(new Date());
                }}
                className="p-3 rounded-xl hover:bg-secondary transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="刷新数据"
                aria-label="刷新数据"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">总代币数</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold">{tokens.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">DEX 代币</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-orange-500">
                {tokens.filter(item => !item.alphaToken.listingCex).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">已上线 CEX</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-green-500">
                {tokens.filter(item => item.alphaToken.listingCex).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500/50">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs sm:text-sm">离线代币</CardDescription>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-red-500">
                {tokens.filter(item => item.alphaToken.offline).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索代币名称、符号或合约地址..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 text-base"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">状态筛选</span>
                  {statusFilter.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {statusFilter.length} 个筛选
                    </Badge>
                  )}
                </div>
                <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} />
              </div>
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">标签筛选</span>
                    {tagFilter.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {tagFilter.length} 个标签
                      </Badge>
                    )}
                  </div>
                  <TagFilter 
                    tagFilter={tagFilter} 
                    setTagFilter={setTagFilter}
                    availableTags={availableTags}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Token List */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{filteredTokens.length} 个代币</span>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                disabled={isResetting}
                className="relative overflow-hidden"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                重置排序
                {isResetting && (
                  <span className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium whitespace-nowrap">代币</th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('price')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        价格
                        {getSortIcon('price')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('percentChange24h')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        24h涨跌
                        {getSortIcon('percentChange24h')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('liquidity')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        流动性
                        {getSortIcon('liquidity')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('marketCap')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        市值
                        {getSortIcon('marketCap')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('volume24h')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        24h交易量
                        {getSortIcon('volume24h')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('holders')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        持有者
                        {getSortIcon('holders')}
                      </button>
                    </th>
                    <th className="text-right p-3 font-medium whitespace-nowrap">
                      <button onClick={() => toggleSort('listingTime')} className="flex items-center gap-1 ml-auto hover:text-blue-600 transition-colors whitespace-nowrap">
                        上线时间
                        {getSortIcon('listingTime')}
                      </button>
                    </th>
                    <th className="text-left p-3 font-medium whitespace-nowrap">标签</th>
                    <th className="text-center p-3 font-medium whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTokens.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="h-12 w-12 opacity-20" />
                          <p className="text-base">未找到匹配的代币</p>
                          {(searchTerm || statusFilter.length > 0 || tagFilter.length > 0) && (
                            <p className="text-sm">尝试调整搜索条件或筛选项</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredTokens.map((item, index) => (
                      <TokenTableRow 
                        key={item.alphaToken.tokenId} 
                        token={item.alphaToken} 
                        metadata={item.tokenMetadata}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TokenTableRow({ 
  token, 
  metadata
}: { 
  token: AlphaToken; 
  metadata: TokenMetadata | null;
}) {
  const priceChange = parseFloat(token.percentChange24h);
  const isPositive = priceChange >= 0;

  return (
    <tr className="border-b hover:bg-muted/50 transition-colors">
      {/* Token Info */}
      <td className="p-3">
        <div className="flex items-center gap-3">
          <TokenDetailPopover token={token} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-lg">
                {token.name}
              </span>
              <span className="text-sm text-muted-foreground">({token.symbol})</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <img
                  src={token.chainIconUrl}
                  alt={token.chainName}
                  width={14}
                  height={14}
                  className="rounded-full flex-shrink-0 object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    console.error('Failed to load chain icon:', token.chainIconUrl);
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxNCAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI3IiBjeT0iNyIgcj0iNyIgZmlsbD0iI2Y1ZjVmNSIvPjwvc3ZnPg==';
                  }}
                />
                {(() => {
                  const explorerUrl = getBlockExplorerUrl(token.chainName, token.contractAddress);
                  if (explorerUrl) {
                    return (
                      <a 
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary hover:underline transition-colors cursor-pointer inline-flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {token.chainName}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    );
                  }
                  return <span>{token.chainName}</span>;
                })()}
              </div>
              <div className="flex gap-1">
                {token.listingCex ? (
                  <Badge variant="default" className="text-xs h-5">CEX</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs h-5">DEX</Badge>
                )}
                {token.offline ? (
                  <Badge variant="destructive" className="text-xs h-5">Offline</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs h-5 border-green-500/50 text-green-600">Online</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </td>

      {/* Price */}
      <td className="p-3 text-right">
        <div className="font-medium">{formatPrice(token.price)}</div>
      </td>

      {/* 24h Change */}
      <td className="p-3 text-right">
        <div className={`flex items-center justify-end gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span className="font-medium text-sm">
            {isPositive ? '+' : ''}{formatPercent(priceChange)}
          </span>
        </div>
      </td>

      {/* Liquidity */}
      <td className="p-3 text-right">
        <div className="font-medium text-sm">
          {token.liquidity ? (
            (() => {
              const liq = typeof token.liquidity === 'string' ? parseFloat(token.liquidity) : token.liquidity;
              return liq >= 1e9 ? 
                `$${(liq / 1e9).toFixed(2)}B` :
              liq >= 1e6 ? 
                `$${(liq / 1e6).toFixed(2)}M` :
              liq >= 1e3 ? 
                `$${(liq / 1e3).toFixed(2)}K` :
                `$${liq.toFixed(2)}`;
            })()
          ) : (
            <span className="text-muted-foreground">--</span>
          )}
        </div>
      </td>

      {/* Market Cap */}
      <td className="p-3 text-right">
        <div className="font-medium text-sm">${formatLargeNumber(token.marketCap)}</div>
      </td>

      {/* Volume 24h */}
      <td className="p-3 text-right">
        <div className="font-medium text-sm">${formatLargeNumber(token.volume24h)}</div>
      </td>

      {/* Holders */}
      <td className="p-3 text-right">
        <div className="font-medium text-sm">{formatLargeNumber(token.holders, 0)}</div>
      </td>

      {/* 上线时间 */}
      <td className="p-3 text-right">
        <div className="font-medium text-sm" title={toMs(token.listingTime) ? new Date(toMs(token.listingTime) as number).toLocaleString('zh-CN') : ''}>
          {toMs(token.listingTime) ? new Date(toMs(token.listingTime) as number).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) : <span className="text-muted-foreground">--</span>}
        </div>
      </td>

      {/* 标签 */}
      <td className="p-3">
        <div className="flex gap-1 flex-wrap">
          {metadata?.tags && metadata.tags.length > 0 ? (
            <>
              {metadata.tags.length <= 2 ? (
                // 如果标签数量 <= 2，显示所有标签
                metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))
              ) : (
                // 如果标签数量 > 2，只显示第一个标签和数量
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div className="flex gap-1 cursor-help">
                        <Badge variant="secondary" className="text-xs">
                          {metadata.tags[0]}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          +{metadata.tags.length - 1}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent 
                      className="max-w-xs p-3 bg-popover border-border shadow-lg"
                      sideOffset={5}
                    >
                      <div className="flex gap-1 flex-wrap">
                        {metadata.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </>
          ) : (
            <span className="text-xs text-muted-foreground">--</span>
          )}
        </div>
      </td>

      {/* 操作 */}
      <td className="p-3 text-center">
        <div className="flex items-center justify-center">
          <HoverPopoverMenu token={token} metadata={metadata} />
        </div>
      </td>
    </tr>
  );
}
