import { configureStore } from "@reduxjs/toolkit";
import { cryptoPriceTrackerApi } from "./services/crypto-price-tracker";

export const store = configureStore({
  reducer: {
    [cryptoPriceTrackerApi.reducerPath]: cryptoPriceTrackerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(cryptoPriceTrackerApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
