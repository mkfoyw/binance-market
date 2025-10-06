"use client";

import { useMemo, useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LoadingState } from "@/components/ui/loading-state";
import { TrendingUp, TrendingDown, Activity, Clock, RefreshCw, MoreHorizontal, ExternalLink } from "lucide-react";
import { useGetPricesBySourceQuery } from "@/lib/services/crypto-price-tracker";
import { PriceDataDetail, TokenMetadata } from "@/lib/types/crypto";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 工具函数 - 获取外部链接
const getBinanceFuturesUrl = (baseSymbol: string, quoteSymbol: string) => {
  return `https://www.binance.com/zh-CN/futures/${baseSymbol}${quoteSymbol}`;
};

const getCoinMarketCapUrl = (slug: string) => {
  return `https://coinmarketcap.com/currencies/${slug}/`;
};

const getCoinGeckoUrl = (id: string) => {
  return `https://www.coingecko.com/zh/coins/${id}`;
};

const getTradingUrl = (source: string, baseSymbol: string, quoteSymbol: string) => {
  return `https://www.binance.com/zh-CN/futures/${baseSymbol}${quoteSymbol}`;
};



// 悬浮菜单组件
function HoverPopoverMenu({ item }: { item: RankingItem }) {
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
    }, 200); // 200ms 延迟关闭
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div 
          className="inline-flex items-center justify-center h-6 w-6 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <MoreHorizontal className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        align="start"
        side="right"
        className="w-auto p-1"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex flex-col gap-1">
          {/* 外部链接 */}
          {item.tokenMetadata?.coinmarketcapSlug && (
            <a
              href={getCoinMarketCapUrl(item.tokenMetadata.coinmarketcapSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-muted rounded-md transition-colors w-full"
            >
              <ExternalLink className="h-4 w-4" />
              在 CoinMarketCap 查看
            </a>
          )}
          
          {item.tokenMetadata?.coingeckoId && (
            <a
              href={getCoinGeckoUrl(item.tokenMetadata.coingeckoId)}
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
}

// 时间段配置
const TIME_PERIODS = {
  "all": { label: "全部", description: "所有时间段排行榜", minutes: 0 },
  "180": { label: "3分钟", description: "3分钟内变化", minutes: 3 },
  "900": { label: "15分钟", description: "15分钟内变化", minutes: 15 },
  "1800": { label: "30分钟", description: "30分钟内变化", minutes: 30 },
  "3600": { label: "1小时", description: "1小时内变化", minutes: 60 },
  "7200": { label: "2小时", description: "2小时内变化", minutes: 120 },
  "14400": { label: "4小时", description: "4小时内变化", minutes: 240 },
  "43200": { label: "12小时", description: "12小时内变化", minutes: 720 },
  "86400": { label: "24小时", description: "24小时内变化", minutes: 1440 },
} as const;

type TimePeriodKey = keyof typeof TIME_PERIODS;

// 排行榜项目接口
interface RankingItem {
  symbol: string;
  baseSymbol: string;
  quoteSymbol: string;
  source: string; // 数据源
  currentPrice: number;
  percentage: number;
  previousPrice: number;
  time: number;
  allPercentages: Record<string, { percentage: number; price: number }>; // 所有时间段的百分比数据
  circulatingSupply?: number; // 流通供应量
  marketCap?: number; // 流通市值
  maxSupply?: number; // 最大供应量
  fdv?: number; // 完全稀释估值（Fully Diluted Valuation）
  tokenMetadata?: TokenMetadata; // 代币元数据
}

// 排行榜卡片组件
function RankingCard({ 
  title, 
  description, 
  items, 
  isPositive,
  period,
  isLoading,
  showExpanded,
  onToggleExpand
}: {
  title: string;
  description: string;
  items: RankingItem[];
  isPositive: boolean;
  period: string;
  isLoading?: boolean;
  showExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const [hoveredMarketCapIndex, setHoveredMarketCapIndex] = useState<number | null>(null);
  
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-green-600" : "text-red-600";
  const bgColorClass = isPositive ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950";
  
  const displayLimit = showExpanded ? 50 : 5;
  const displayItems = items.slice(0, displayLimit);

  return (
    <Card className={`${bgColorClass} border-l-4 ${isPositive ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`h-5 w-5 ${colorClass}`} />
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {TIME_PERIODS[period as TimePeriodKey]?.label}
          </Badge>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-md bg-white/50 dark:bg-gray-800/50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div>
                    <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                    <div className="w-20 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                  <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* 表头 */}
            <div className="flex items-center px-3 pb-2 border-b text-xs font-medium text-muted-foreground">
              <div className="w-32">排名</div>
              <div className="flex-1 text-center">价格</div>
              <div className="w-24 text-center">涨跌幅</div>
              <div className="flex-1 text-right">流通市值</div>
              <div className="w-10 text-right">操作</div>
            </div>

            {displayItems.map((item, index) => (
              <div
                key={`${item.symbol}-${index}`}
                className="flex items-center p-3 rounded-md bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              >
                {/* 左侧：排名和交易对名称 */}
                <div className="flex items-center gap-3 w-32">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    index < 3 
                      ? (isPositive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200')
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <a
                      href={getTradingUrl(item.source, item.baseSymbol, item.quoteSymbol)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-base hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                      title={`在 ${item.source} 查看 ${item.baseSymbol}/${item.quoteSymbol}`}
                    >
                      {item.baseSymbol}
                    </a>
                  </div>
                </div>

                {/* 中间左：价格 */}
                <div className="flex-1 text-center">
                  <div className="text-lg font-bold text-foreground">
                    ${item.currentPrice.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: item.currentPrice < 1 ? 6 : 2 
                    })}
                  </div>
                </div>

                {/* 中间右：涨跌幅 */}
                <div className="text-center w-24">
                  <Popover open={hoveredItemIndex === index}>
                    <PopoverTrigger asChild>
                      <div 
                        className={`font-bold text-lg cursor-pointer hover:underline ${
                          item.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                        onMouseEnter={() => setHoveredItemIndex(index)}
                        onMouseLeave={() => setHoveredItemIndex(null)}
                      >
                        {item.percentage >= 0 ? '+' : ''}{item.percentage.toFixed(2)}%
                      </div>
                    </PopoverTrigger>
                    <PopoverContent 
                      className="w-80 p-4"
                      onMouseEnter={() => setHoveredItemIndex(index)}
                      onMouseLeave={() => setHoveredItemIndex(null)}
                    >
                      <div className="space-y-3">
                        <div className="font-semibold text-sm text-center border-b pb-2">
                          {item.baseSymbol}/{item.quoteSymbol} - 所有时间段变化
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(TIME_PERIODS).map(([periodKey, periodConfig]) => {
                            const periodData = item.allPercentages[periodKey];
                            if (!periodData) return null;
                            
                            return (
                              <div key={periodKey} className="flex justify-between items-center p-2 rounded bg-muted/50">
                                <span className="text-xs font-medium">{periodConfig.label}</span>
                                <span className={`text-xs font-bold ${
                                  periodData.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {periodData.percentage >= 0 ? '+' : ''}{periodData.percentage.toFixed(2)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
              
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                
                {/* 右侧：流通市值 */}
                <div className="flex-1 text-right">
                  {item.marketCap ? (
                    <Popover open={hoveredMarketCapIndex === index}>
                      <PopoverTrigger asChild>
                        <div 
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                          onMouseEnter={() => setHoveredMarketCapIndex(index)}
                          onMouseLeave={() => setHoveredMarketCapIndex(null)}
                        >
                          ${item.marketCap >= 1e9 
                            ? `${(item.marketCap / 1e9).toFixed(2)}B`
                            : item.marketCap >= 1e6
                            ? `${(item.marketCap / 1e6).toFixed(2)}M`
                            : `${(item.marketCap / 1e3).toFixed(2)}K`
                          }
                        </div>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 p-3"
                        onMouseEnter={() => setHoveredMarketCapIndex(index)}
                        onMouseLeave={() => setHoveredMarketCapIndex(null)}
                      >
                        <div className="space-y-2">
                          <div className="font-semibold text-sm border-b pb-2">
                            {item.baseSymbol} 市值信息
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">流通市值:</span>
                              <span className="font-medium">
                                ${item.marketCap >= 1e9 
                                  ? `${(item.marketCap / 1e9).toFixed(2)}B`
                                  : `${(item.marketCap / 1e6).toFixed(2)}M`
                                }
                              </span>
                            </div>
                            {item.fdv && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">FDV:</span>
                                <span className="font-medium">
                                  ${item.fdv >= 1e9 
                                    ? `${(item.fdv / 1e9).toFixed(2)}B`
                                    : `${(item.fdv / 1e6).toFixed(2)}M`
                                  }
                                </span>
                              </div>
                            )}
                            {item.circulatingSupply && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">流通量:</span>
                                <span className="font-medium">
                                  {item.circulatingSupply >= 1e9
                                    ? `${(item.circulatingSupply / 1e9).toFixed(2)}B`
                                    : item.circulatingSupply >= 1e6
                                    ? `${(item.circulatingSupply / 1e6).toFixed(2)}M`
                                    : item.circulatingSupply.toLocaleString()
                                  }
                                </span>
                              </div>
                            )}
                            {item.maxSupply && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">最大供应量:</span>
                                <span className="font-medium">
                                  {item.maxSupply >= 1e9
                                    ? `${(item.maxSupply / 1e9).toFixed(2)}B`
                                    : item.maxSupply >= 1e6
                                    ? `${(item.maxSupply / 1e6).toFixed(2)}M`
                                    : item.maxSupply.toLocaleString()
                                  }
                                </span>
                              </div>
                            )}
                            {item.circulatingSupply && item.maxSupply && (
                              <div className="flex justify-between pt-1 border-t">
                                <span className="text-muted-foreground">流通率:</span>
                                <span className="font-medium">
                                  {((item.circulatingSupply / item.maxSupply) * 100).toFixed(2)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <div className="text-xs text-muted-foreground/50">-</div>
                  )}
                </div>

                {/* 最后一列：操作菜单 */}
                <div className="w-10 text-right">
                  <HoverPopoverMenu item={item} />
                </div>
              </div>
            ))}
            
            {/* 展开/收起按钮 */}
            {items.length > 5 && (
              <div className="flex justify-center pt-2 border-t">
                <button
                  onClick={onToggleExpand}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                >
                  {showExpanded ? (
                    <>
                      <span>收起</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      <span>展开更多 ({items.length - 5})</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>该时间段暂无数据</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 统计卡片组件
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend 
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.isPositive ? '+' : ''}{trend.value.toFixed(2)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function BinanceAnalysisPage() {
  const [selectedPeriods, setSelectedPeriods] = useState<TimePeriodKey[]>(["all"]); // 支持多选时间段
  const [expandedPeriods, setExpandedPeriods] = useState<Record<string, boolean>>({}); // 每个时间段独立的展开状态
  const { data: binancePrices, isLoading, error, refetch } = useGetPricesBySourceQuery("binance", {
    pollingInterval: 15000, // 每15秒自动刷新数据
  });

  // 处理时间段选择
  const handlePeriodToggle = (period: TimePeriodKey) => {
    if (period === "all") {
      setSelectedPeriods(["all"]);
    } else {
      setSelectedPeriods(prev => {
        const filtered = prev.filter(p => p !== "all");
        if (filtered.includes(period)) {
          const newSelection = filtered.filter(p => p !== period);
          return newSelection.length === 0 ? ["all"] : newSelection;
        } else {
          return [...filtered, period];
        }
      });
    }
  };

  // 处理单个时间段的展开/收起
  const handlePeriodExpand = (period: string) => {
    setExpandedPeriods(prev => ({
      ...prev,
      [period]: !prev[period]
    }));
  };

  // 处理数据并生成排行榜
  const rankingData = useMemo(() => {
    if (!binancePrices?.data) return { isAllPeriods: false, rankings: [] };

    const periodsToShow = selectedPeriods.includes("all") 
      ? Object.keys(TIME_PERIODS).filter(period => period !== "all")
      : selectedPeriods;

    const allPeriodRankings = periodsToShow.map(period => {
      const allItems: RankingItem[] = [];

      binancePrices.data.forEach(priceDetail => {
        const { priceData, tokenMetadata } = priceDetail;
        const periodData = priceData.percentages[period];

        if (periodData) {
          // 计算流通市值和完全稀释估值
          const circulatingSupply = tokenMetadata?.circulatingSupply;
          const maxSupply = tokenMetadata?.maxSupply;
          const marketCap = circulatingSupply && circulatingSupply > 0
            ? priceData.price * circulatingSupply
            : undefined;
          const fdv = maxSupply && maxSupply > 0
            ? priceData.price * maxSupply
            : undefined;

          const item: RankingItem = {
            symbol: `${priceData.baseSymbol}${priceData.quoteSymbol}`,
            baseSymbol: priceData.baseSymbol,
            quoteSymbol: priceData.quoteSymbol,
            source: priceData.source,
            currentPrice: priceData.price,
            percentage: periodData.percentage,
            previousPrice: periodData.price,
            time: priceData.time,
            allPercentages: priceData.percentages,
            circulatingSupply,
            marketCap,
            maxSupply,
            fdv,
            tokenMetadata,
          };
          allItems.push(item);
        }
      });

      allItems.sort((a, b) => b.percentage - a.percentage);
      const topGainers = allItems.slice(0, Math.ceil(allItems.length / 2));
      const topLosers = allItems.slice(Math.ceil(allItems.length / 2)).reverse();

      return {
        period,
        periodConfig: TIME_PERIODS[period as keyof typeof TIME_PERIODS],
        topGainers,
        topLosers
      };
    });

    return { 
      isAllPeriods: selectedPeriods.includes("all"), 
      rankings: allPeriodRankings 
    };
  }, [binancePrices, selectedPeriods]);

  // 计算统计数据
  const stats = useMemo(() => {
    if (!binancePrices?.data) return null;

    const totalTokens = binancePrices.data.length;
    
    return {
      totalTokens,
      isMultiSelect: !selectedPeriods.includes("all") && selectedPeriods.length > 1,
      isAllPeriods: selectedPeriods.includes("all"),
      selectedCount: selectedPeriods.includes("all") ? Object.keys(TIME_PERIODS).length - 1 : selectedPeriods.length,
    };
  }, [binancePrices, selectedPeriods]);

  // 刷新数据
  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <LoadingState message="正在加载币安行情数据..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">数据加载失败</h3>
            <p className="text-muted-foreground text-center">
              无法获取币安行情数据，请检查网络连接或稍后重试。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">币安合约行情分析</h1>
          <p className="text-muted-foreground">实时展示币安交易所合约不同时间段的涨跌幅排行榜</p>
        </div>
        {binancePrices?.data?.[0] && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground md:w-auto w-full">
            <Clock className="h-4 w-4" />
            <span>
              最后更新: {format(new Date(binancePrices.data[0].priceData.time * 1000), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
            </span>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="总交易对"
            value={stats.totalTokens}
            icon={Activity}
            description="币安交易对总数"
          />
          <StatsCard
            title="选中时间段"
            value={stats.selectedCount}
            icon={Clock}
            description={
              stats.isAllPeriods ? "显示所有时间段" : 
              stats.isMultiSelect ? "多选模式" : "单选模式"
            }
          />
          <StatsCard
            title="显示模式"
            value={stats.isAllPeriods ? "全部" : stats.isMultiSelect ? "多选" : "单选"}
            icon={stats.isMultiSelect ? Activity : Clock}
            description={
              stats.isAllPeriods ? "同时显示所有时间段" :
              stats.isMultiSelect ? "可同时查看多个时间段" : "仅显示选中时间段"
            }
          />
          <StatsCard
            title="实时更新"
            value="15秒"
            icon={RefreshCw}
            description="每15秒自动刷新一次数据"
          />
        </div>
      )}

      {/* 排行榜面板 */}
      <div className="space-y-4">
        {/* 时间周期筛选按钮 - 粘性定位 */}
  <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -mx-4 px-4 border-b shadow-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(TIME_PERIODS).map(([period, config]) => {
              const isSelected = selectedPeriods.includes(period as TimePeriodKey);
              return (
                <Button
                  key={period}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePeriodToggle(period as TimePeriodKey)}
                  className={`transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "hover:bg-muted"
                  }`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {config.label}
                  {period !== "all" && !selectedPeriods.includes("all") && isSelected && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* 显示选中时间段的排行榜 */}
        <div className="space-y-8">
          {rankingData.rankings.map((ranking) => (
            <div key={ranking.period} className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <RankingCard
                  title={`${ranking.periodConfig.label}涨幅榜`}
                  description={`${ranking.periodConfig.description}表现最佳的交易对`}
                  items={ranking.topGainers}
                  isPositive={true}
                  period={ranking.period}
                  isLoading={isLoading}
                  showExpanded={expandedPeriods[ranking.period] || false}
                  onToggleExpand={() => handlePeriodExpand(ranking.period)}
                />
                
                <RankingCard
                  title={`${ranking.periodConfig.label}跌幅榜`}
                  description={`${ranking.periodConfig.description}表现最差的交易对`}
                  items={ranking.topLosers}
                  isPositive={false}
                  period={ranking.period}
                  isLoading={isLoading}
                  showExpanded={expandedPeriods[ranking.period] || false}
                  onToggleExpand={() => handlePeriodExpand(ranking.period)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}