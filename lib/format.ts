import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

/**
 * 格式化时间戳为相对时间
 * @param timestamp 时间戳
 * @returns 格式化后的相对时间字符串
 */
export function formatRelativeTime(timestamp: number): string {
  try {
    return formatDistanceToNow(new Date(timestamp), { 
      addSuffix: true,
      locale: zhCN 
    });
  } catch {
    return new Date(timestamp).toLocaleDateString('zh-CN');
  }
}

/**
 * 格式化时间戳为完整日期时间
 * @param timestamp 时间戳
 * @returns 格式化后的日期时间字符串
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 格式化点赞数
 * @param likes 点赞数
 * @returns 格式化后的点赞数字符串
 */
export function formatLikes(likes: number): string {
  if (likes >= 1000) {
    return `${(likes / 1000).toFixed(1)}k`;
  }
  return likes.toString();
}

/**
 * 格式化大数字（K, M, B）
 * @param num 数字
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatLargeNumber(num: number | string, decimals = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  
  if (n >= 1e9) {
    return `${(n / 1e9).toFixed(decimals)}B`;
  }
  if (n >= 1e6) {
    return `${(n / 1e6).toFixed(decimals)}M`;
  }
  if (n >= 1e3) {
    return `${(n / 1e3).toFixed(decimals)}K`;
  }
  return n.toFixed(decimals);
}

/**
 * 格式化价格
 * @param price 价格
 * @param decimals 小数位数
 * @returns 格式化后的价格字符串
 */
export function formatPrice(price: number | string, decimals = 6): string {
  const p = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(p)) return '$0';
  
  if (p >= 1) {
    return `$${p.toFixed(2)}`;
  }
  return `$${p.toFixed(decimals)}`;
}

/**
 * 格式化百分比
 * @param percent 百分比
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercent(percent: number | string, decimals = 2): string {
  const p = typeof percent === 'string' ? parseFloat(percent) : percent;
  if (isNaN(p)) return '0%';
  
  const sign = p > 0 ? '+' : '';
  return `${sign}${p.toFixed(decimals)}%`;
}