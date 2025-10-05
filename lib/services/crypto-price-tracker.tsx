import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { PriceDataResponse,  } from "../types/crypto";

// 使用 Cloudflare Tunnel 提供的 HTTPS 地址
const API_BASE_URL = "https://researchers-cologne-develop-figure.trycloudflare.com";

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
      query: () => "/api/v1/prices",
      providesTags: ["Price"],
    }),
    
    // 根据来源获取价格数据
    getPricesBySource: builder.query<PriceDataResponse & { source: string }, string>({
      query: (source) => `/api/v1/prices/source/${source}`,
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
  useGetHealthStatusQuery,
} = cryptoPriceTrackerApi;
