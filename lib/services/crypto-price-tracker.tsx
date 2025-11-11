import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PriceDataResponse } from "../types/crypto";
import { BinanceAlphaResponse } from "../types/binance-alpha";

// 使用 Cloudflare Tunnel 提供的 HTTPS 地址
const API_BASE_URL = "https://researchers-cologne-develop-figure.trycloudflare.com/api/v1";

//const API_BASE_URL= "http://localhost:18080/api/v1";

export const cryptoPriceTrackerApi = createApi({
  reducerPath: "cryptoPriceTrackerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ["Price"],
  endpoints: (builder) => ({
    // 获取所有价格数据
    getAllPrices: builder.query<PriceDataResponse, void>({
      query: () => "/prices",
      providesTags: ["Price"],
    }),
    
    // 根据来源获取价格数据
    getPricesBySource: builder.query<PriceDataResponse & { source: string }, string>({
      query: (source) => `/prices/source/${source}`,
      providesTags: ["Price"],
    }),
    
    // 获取 Binance Alpha tokens（包含 metadata）
    getBinanceAlphaTokens: builder.query<BinanceAlphaResponse, void>({
      query: () => "/binance-alpha/tokens",
      providesTags: ["Price"],
    }),
    
    // 健康检查（注意：health 端点在根路径，不在 /api/v1 下）
    getHealthStatus: builder.query<{ status: string; message: string }, void>({
      query: () => "/health",
    }),
  }),
});

export const {
  useGetAllPricesQuery,
  useGetPricesBySourceQuery,
  useGetBinanceAlphaTokensQuery,
  useGetHealthStatusQuery,
} = cryptoPriceTrackerApi;
