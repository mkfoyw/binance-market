"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  BarChart3, 
  Tag,
  Building2,
  RefreshCw,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  Layers,
  MoreHorizontal,
  ExternalLink,
  Loader2,
  RotateCcw,
  DollarSign
} from "lucide-react";
import { useGetAllPricesQuery } from "@/lib/services/crypto-price-tracker";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DEFAULT_TAGS } from "@/lib/types/crypto";

import { Duration } from "@/lib/types/crypto";

interface TokenAnalysisData {
  id: string;
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  source: string;
  price: number;
  percentages: Record<Duration, { percentage: number; price: number }>;
  updateTime: number;
  tags: string[];
  category?: string;
  chain?: string;
  fdv?: number; // 完全稀释估值
  marketCap?: number; // 流通市值
  coingeckoId?: string; // CoinGecko ID
  coinmarketcapSlug?: string; // CoinMarketCap Slug
  maxSupply?: number; // 最大供应量
  circulatingSupply?: number; // 流通供应量
}

type SortField = 'symbol' | 'price' | 'fdv' | 'marketCap' | 'percentage_3m' | 'percentage_15m' | 'percentage_30m' | 'percentage_1h' | 'percentage_4h' | 'percentage_12h' | 'percentage_1d' | 'none';
type SortDirection = 'asc' | 'desc';

// 工具函数
function getBinanceFuturesUrl(symbol: string): string {
  return `https://www.binance.com/zh-CN/futures/${symbol}USDT`;
}

function getCoinMarketCapUrl(slug: string): string {
  return `https://coinmarketcap.com/currencies/${slug}/`;
}

function getCoinGeckoUrl(id: string): string {
  return `https://www.coingecko.com/en/coins/${id}`;
}

function getTradingUrl(source: string, baseSymbol: string, quoteSymbol: string, chain?: string): string {
  switch (source.toLowerCase()) {
    case 'binance':
      return `https://www.binance.com/zh-CN/futures/${baseSymbol}${quoteSymbol}`;
    case 'gate':
      return `https://www.gate.io/trade/${baseSymbol}_${quoteSymbol}`;
    case 'dexscreener':
      return chain ? `https://dexscreener.com/${chain}/${baseSymbol}` : '#';
    default:
      return '#';
  }
}

// 加载状态组件
function LoadingState({ message = "加载中..." }: { message?: string }) {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-[1600px]">
        {/* Header Skeleton */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                <BarChart3 className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  市场行情分析
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  {message}
                </p>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/50 animate-pulse">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* 统计卡片骨架 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-l-4 border-l-primary/20 animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 筛选卡片骨架 */}
        <Card className="shadow-md animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* 表格骨架 */}
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background/95 border-b">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <th key={i} className="p-3">
                        <Skeleton className="h-4 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td className="p-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-20" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-16" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-24" />
                      </td>
                      <td className="p-3">
                        <Skeleton className="h-6 w-8" />
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



// 悬浮菜单组件 - 使用 React.memo 防止不必要的重新渲染
const HoverPopoverMenu = React.memo(function HoverPopoverMenu({ token }: { token: TokenAnalysisData }) {
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
    }, 200); // 200ms 延迟关闭，给用户时间移动到菜单上
  }, []);

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
          {/* 外部链接 */}
          {token.coinmarketcapSlug && (
            <a
              href={getCoinMarketCapUrl(token.coinmarketcapSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors w-full"
            >
              <ExternalLink className="h-4 w-4" />
              在 CoinMarketCap 查看
            </a>
          )}
          {token.coingeckoId && (
            <a
              href={getCoinGeckoUrl(token.coingeckoId)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors w-full"
            >
              <ExternalLink className="h-4 w-4" />
              在 CoinGecko 查看
            </a>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
});

export default function MarketAnalysisPage() {
  // 状态管理
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedMarketCapFilter, setSelectedMarketCapFilter] = useState<number>(0); // 0表示不筛选
  const [sortField, setSortField] = useState<SortField>('none');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  // 重置按钮动画状态
  const [isResetting, setIsResetting] = useState(false);
  


  // API 查询 - 优化配置以减少对 Dialog 状态的影响
  const { data: allPrices, isLoading, error, refetch } = useGetAllPricesQuery(undefined, {
    pollingInterval: 30000, // 每30秒自动刷新
    refetchOnFocus: false, // 防止窗口焦点变化时重新获取
    refetchOnReconnect: true, // 重新连接时获取数据
    selectFromResult: (result) => ({
      ...result,
      // 使用稳定的引用减少重新渲染
      data: result.data,
    }),
  });



  // 处理和转换数据 - 使用更稳定的依赖关系
  const processedData = useMemo(() => {
    if (!allPrices?.data) return [];

    const tokens: TokenAnalysisData[] = [];

    allPrices.data.forEach(priceDetail => {
      const { priceData, tokenMetadata } = priceDetail;
      
      // 计算FDV (完全稀释估值) = 价格 × 最大供应量
      const fdv = tokenMetadata?.maxSupply && tokenMetadata.maxSupply > 0 
        ? priceData.price * tokenMetadata.maxSupply 
        : undefined;
      
      // 计算流通市值 (Market Cap) = 价格 × 流通供应量
      const marketCap = tokenMetadata?.circulatingSupply && tokenMetadata.circulatingSupply > 0
        ? priceData.price * tokenMetadata.circulatingSupply
        : undefined;
      
      tokens.push({
        id: `${priceData.source}-${priceData.baseSymbol}-${priceData.quoteSymbol}`,
        symbol: priceData.baseSymbol, // 只使用 baseSymbol
        baseSymbol: priceData.baseSymbol,
        quoteSymbol: priceData.quoteSymbol,
        source: priceData.source,
        price: priceData.price,
        percentages: priceData.percentages,
        updateTime: priceData.time,
        tags: tokenMetadata?.tags || [],
        category: tokenMetadata?.category,
        chain: tokenMetadata?.chain,
        fdv: fdv,
        marketCap: marketCap,
        coingeckoId: tokenMetadata?.coingeckoId,
        coinmarketcapSlug: tokenMetadata?.coinmarketcapSlug,
        maxSupply: tokenMetadata?.maxSupply,
        circulatingSupply: tokenMetadata?.circulatingSupply,
      });
    });

    return tokens;
  }, [allPrices?.data]); // 只依赖于数据，而不是整个查询结果

  // 获取所有可用的数据源、类别和标签
  const availableSources = useMemo(() => {
    const sources = new Set(processedData.map(token => token.source));
    return Array.from(sources).sort();
  }, [processedData]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    processedData.forEach(token => {
      if (token.category) {
        categories.add(token.category);
      }
    });
    return Array.from(categories).sort();
  }, [processedData]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    processedData.forEach(token => {
      token.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [processedData]);

  // 筛选数据
  const filteredData = useMemo(() => {
    let filtered = processedData;

    // 数据源筛选
    if (selectedSource !== "all") {
      filtered = filtered.filter(token => token.source === selectedSource);
    }

    // 类别筛选
    if (selectedCategory !== "all") {
      filtered = filtered.filter(token => token.category === selectedCategory);
    }

    // 标签筛选 - 多选模式
    if (selectedTags.length > 0) {
      filtered = filtered.filter(token => 
        selectedTags.some(selectedTag => token.tags.includes(selectedTag))
      );
    }

    // 流通市值筛选
    if (selectedMarketCapFilter > 0) {
      filtered = filtered.filter(token => 
        token.marketCap && token.marketCap >= selectedMarketCapFilter
      );
    }

    // 搜索筛选 - 对所有代币进行全局搜索（在其他筛选之后应用）
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // 在 processedData 中搜索，而不是在已筛选的数据中搜索
      const searchResults = processedData.filter(token => 
        token.symbol.toLowerCase().includes(query) ||
        token.baseSymbol.toLowerCase().includes(query) ||
        token.quoteSymbol.toLowerCase().includes(query) ||
        token.source.toLowerCase().includes(query) ||
        token.category?.toLowerCase().includes(query) ||
        token.chain?.toLowerCase().includes(query) ||
        token.tags.some(tag => tag.toLowerCase().includes(query))
      );
      // 使用搜索结果替换筛选结果
      filtered = searchResults;
    }

    // 排序
    if (sortField !== 'none') {
      filtered.sort((a, b) => {
        let valueA: number, valueB: number;

        switch (sortField) {
          case 'symbol':
            return sortDirection === 'asc' 
              ? a.symbol.localeCompare(b.symbol)
              : b.symbol.localeCompare(a.symbol);
          case 'price':
            valueA = a.price;
            valueB = b.price;
            break;
          case 'fdv':
            valueA = a.fdv || 0;
            valueB = b.fdv || 0;
            break;
          case 'marketCap':
            valueA = a.marketCap || 0;
            valueB = b.marketCap || 0;
            break;
          case 'percentage_3m':
            valueA = a.percentages["3m"]?.percentage || 0;
            valueB = b.percentages["3m"]?.percentage || 0;
            break;
          case 'percentage_15m':
            valueA = a.percentages["15m"]?.percentage || 0;
            valueB = b.percentages["15m"]?.percentage || 0;
            break;
          case 'percentage_30m':
            valueA = a.percentages["30m"]?.percentage || 0;
            valueB = b.percentages["30m"]?.percentage || 0;
            break;
          case 'percentage_1h':
            valueA = a.percentages["1h"]?.percentage || 0;
            valueB = b.percentages["1h"]?.percentage || 0;
            break;
          case 'percentage_4h':
            valueA = a.percentages["4h"]?.percentage || 0;
            valueB = b.percentages["4h"]?.percentage || 0;
            break;
          case 'percentage_12h':
            valueA = a.percentages["12h"]?.percentage || 0;
            valueB = b.percentages["12h"]?.percentage || 0;
            break;
          case 'percentage_1d':
            valueA = a.percentages["1d"]?.percentage || 0;
            valueB = b.percentages["1d"]?.percentage || 0;
            break;
          default:
            return 0;
        }

        if (sortDirection === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    return filtered;
  }, [processedData, searchQuery, selectedSource, selectedCategory, selectedTags, selectedMarketCapFilter, sortField, sortDirection]);

  // 处理列头点击排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 如果点击的是当前排序字段，切换排序方向
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 如果点击的是新字段，设置为该字段并默认降序
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 处理标签选择（多选）
  const handleTagToggle = (tag: string) => {
    if (tag === "all") {
      setSelectedTags([]);
    } else {
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-blue-600" /> : 
      <ChevronDown className="h-4 w-4 text-blue-600" />;
  };

  // 重置排序
  const handleReset = () => {
    setIsResetting(true);
    setSortField('none');
    setSortDirection('desc');
    
    // 动画结束后重置状态
    setTimeout(() => {
      setIsResetting(false);
    }, 600);
  };

  // 统计数据
  const stats = useMemo(() => {
    const totalTokens = filteredData.length;
    // 使用24小时数据作为主要统计指标
    const mainPeriod: Duration = "1d";
    const gainers = filteredData.filter(token => 
      (token.percentages[mainPeriod]?.percentage || 0) > 0
    ).length;
    const losers = filteredData.filter(token => 
      (token.percentages[mainPeriod]?.percentage || 0) < 0
    ).length;
    const avgChange = totalTokens > 0 
      ? filteredData.reduce((sum, token) => 
          sum + (token.percentages[mainPeriod]?.percentage || 0), 0) / totalTokens
      : 0;

    return { totalTokens, gainers, losers, avgChange };
  }, [filteredData]);

  if (isLoading) {
    return (
      <div className="w-full py-6 px-2">
        <LoadingState message="正在加载市场数据..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-6 px-2">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">数据加载失败</h3>
            <p className="text-muted-foreground text-center">
              无法获取市场数据，请检查网络连接或稍后重试。
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              重试
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-[1600px]">
        {/* 页面标题 */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  市场行情分析
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-1">
                  从多个数据源对加密货币市场代币的涨跌幅进行分析和排序
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {processedData.length > 0 && (
                <div className="text-right text-sm text-muted-foreground">
                  <div>最后更新</div>
                  <div className="font-mono">
                    {format(new Date(Math.max(...processedData.map(t => t.updateTime)) * 1000), 'HH:mm:ss', { locale: zhCN })}
                  </div>
                </div>
              )}
              <button
                onClick={() => window.location.reload()}
                className="p-3 rounded-xl hover:bg-secondary transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="刷新数据"
                aria-label="刷新数据"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-primary/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总代币数</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTokens}</div>
              <p className="text-xs text-muted-foreground">当前筛选结果</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">上涨代币</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.gainers}</div>
              <p className="text-xs text-muted-foreground">24小时内上涨</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-red-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">下跌代币</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.losers}</div>
              <p className="text-xs text-muted-foreground">24小时内下跌</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">平均涨跌</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.avgChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.avgChange >= 0 ? '+' : ''}{stats.avgChange.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">24小时平均变化</p>
            </CardContent>
          </Card>
        </div>

        {/* 筛选和搜索控制 */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              筛选和搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 搜索框 */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索代币..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* 数据源和类别筛选 - 一行显示 */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* 数据源筛选 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">数据源</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedSource === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource("all")}
                    className={`transition-all ${
                      selectedSource === "all" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    所有数据源
                  </Button>
                  <Button
                    variant={selectedSource === "binance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource("binance")}
                    className={`transition-all ${
                      selectedSource === "binance" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    Binance
                  </Button>
                  <Button
                    variant={selectedSource === "gate" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource("gate")}
                    className={`transition-all ${
                      selectedSource === "gate" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    Gate
                  </Button>
                  <Button
                    variant={selectedSource === "dexscreener" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSource("dexscreener")}
                    className={`transition-all ${
                      selectedSource === "dexscreener" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    DexScreener
                  </Button>
                </div>
              </div>

              {/* 类别筛选 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">类别</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={`transition-all ${
                      selectedCategory === "all" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    所有类别
                  </Button>
                  <Button
                    variant={selectedCategory === "popular" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("popular")}
                    className={`transition-all ${
                      selectedCategory === "popular" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    Popular
                  </Button>
                  <Button
                    variant={selectedCategory === "seed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("seed")}
                    className={`transition-all ${
                      selectedCategory === "seed" 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    Seed
                  </Button>
                </div>
              </div>
            </div>

            {/* 标签筛选 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">标签 {selectedTags.length > 0 && `(${selectedTags.length})`}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedTags.length === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleTagToggle("all")}
                  className={`transition-all ${
                    selectedTags.length === 0 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  所有标签
                </Button>
                {/* 默认标签 */}
                {DEFAULT_TAGS.map(defaultTag => (
                  <Button
                    key={defaultTag}
                    variant={selectedTags.includes(defaultTag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(defaultTag)}
                    className={`transition-all ${
                      selectedTags.includes(defaultTag) 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    {defaultTag}
                  </Button>
                ))}
                {/* 其他动态标签 */}
                {availableTags.filter(tag => !DEFAULT_TAGS.includes(tag)).map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className={`transition-all ${
                      selectedTags.includes(tag) 
                        ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                        : "hover:scale-105"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* 流通市值筛选 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">流通市值</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedMarketCapFilter === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(0)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 0 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  不限
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 5e7 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(5e7)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 5e7 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 5000万
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 1e8 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(1e8)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 1e8 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 1亿
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 2e8 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(2e8)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 2e8 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 2亿
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 3e8 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(3e8)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 3e8 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 3亿
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 5e8 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(5e8)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 5e8 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 5亿
                </Button>
                <Button
                  variant={selectedMarketCapFilter === 1e9 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMarketCapFilter(1e9)}
                  className={`transition-all ${
                    selectedMarketCapFilter === 1e9 
                      ? "bg-blue-500 hover:bg-blue-600 text-white shadow-md scale-105" 
                      : "hover:scale-105"
                  }`}
                >
                  &gt; 10亿
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{filteredData.length} 个代币</span>
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
                  <th className="text-left p-3 font-medium">
                    <button 
                      onClick={() => handleSort('symbol')}
                      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                    >
                      代币/来源
                      {getSortIcon('symbol')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('price')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      价格
                      {getSortIcon('price')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_3m')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      3分钟
                      {getSortIcon('percentage_3m')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_15m')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      15分钟
                      {getSortIcon('percentage_15m')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_30m')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      30分钟
                      {getSortIcon('percentage_30m')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_1h')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      1小时
                      {getSortIcon('percentage_1h')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_4h')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      4小时
                      {getSortIcon('percentage_4h')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_12h')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      12小时
                      {getSortIcon('percentage_12h')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('percentage_1d')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      24小时
                      {getSortIcon('percentage_1d')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('marketCap')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      流通市值
                      {getSortIcon('marketCap')}
                    </button>
                  </th>
                  <th className="text-right p-3 font-medium">
                    <button 
                      onClick={() => handleSort('fdv')}
                      className="flex items-center gap-2 ml-auto hover:text-blue-600 transition-colors"
                    >
                      FDV
                      {getSortIcon('fdv')}
                    </button>
                  </th>
                  <th className="text-left p-3 font-medium">标签</th>
                  <th className="text-center p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((token, index) => {
                  // 获取各个时间段的涨跌幅
                  const periods: Duration[] = ["3m", "15m", "30m", "1h", "4h", "12h", "1d"];
                  const percentages = periods.map(period => 
                    token.percentages[period]?.percentage || 0
                  );

                  return (
                    <tr key={token.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <div>
                          <div className="font-semibold text-lg">
                            {token.baseSymbol}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <a
                              href={getTradingUrl(token.source, token.baseSymbol, token.quoteSymbol, token.chain)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block"
                            >
                              <Badge variant="outline" className="text-xs hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300 transition-colors cursor-pointer">
                                {token.source}
                              </Badge>
                            </a>
                            {token.category && (
                              <span className="text-xs text-muted-foreground">{token.category}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-medium">
                          ${token.price.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: token.price < 1 ? 6 : 2 
                          })}
                        </div>
                      </td>
                      {/* 各时间段涨跌幅 */}
                      {percentages.map((percentage, idx) => (
                        <td key={idx} className="p-3 text-right">
                          <div className={`flex items-center justify-end gap-1 ${
                            percentage >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <span className="font-medium text-sm">
                              {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                      ))}
                      {/* 流通市值 */}
                      <td className="p-3 text-right">
                        <div className="font-medium text-sm">
                          {token.marketCap ? (
                            token.marketCap >= 1e9 ? 
                              `$${(token.marketCap / 1e9).toFixed(2)}B` :
                            token.marketCap >= 1e6 ? 
                              `$${(token.marketCap / 1e6).toFixed(2)}M` :
                            token.marketCap >= 1e3 ? 
                              `$${(token.marketCap / 1e3).toFixed(2)}K` :
                              `$${token.marketCap.toFixed(2)}`
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </div>
                      </td>
                      {/* FDV */}
                      <td className="p-3 text-right">
                        <div className="font-medium text-sm">
                          {token.fdv ? (
                            token.fdv >= 1e9 ? 
                              `$${(token.fdv / 1e9).toFixed(2)}B` :
                            token.fdv >= 1e6 ? 
                              `$${(token.fdv / 1e6).toFixed(2)}M` :
                            token.fdv >= 1e3 ? 
                              `$${(token.fdv / 1e3).toFixed(2)}K` :
                              `$${token.fdv.toFixed(2)}`
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 flex-wrap">
                          {token.tags.length <= 2 ? (
                            // 如果标签数量 <= 2，显示所有标签
                            token.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="secondary" className="text-xs">
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
                                      {token.tags[0]}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      +{token.tags.length - 1}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent 
                                  className="max-w-xs p-3 bg-popover border-border shadow-lg"
                                  sideOffset={5}
                                >
                                  <div className="flex gap-1 flex-wrap">
                                    {token.tags.map((tag, tagIndex) => (
                                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          <HoverPopoverMenu token={token} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
