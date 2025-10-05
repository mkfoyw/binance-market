"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Provider store={store}>
        {children}
      </Provider>
    </ThemeProvider>
  );
}
