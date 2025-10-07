import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface LoadingCardProps {
  count?: number;
}

export function LoadingCard({ count = 1 }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="h-[400px] flex flex-col">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
          
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-6" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
}

interface LoadingStateProps {
  message?: string;
  count?: number;
}

export function LoadingState({ message = "加载中...", count = 3 }: LoadingStateProps) {
  return (
    <div className="w-full py-4 px-2 space-y-4">
      {/* 页面标题骨架 */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      {/* 统计卡片骨架 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 筛选和搜索骨架 */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-9 w-full max-w-md" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据表格骨架 */}
      <Card className="animate-pulse">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* 表头 */}
            <div className="flex gap-4 pb-3 border-b">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-16 ml-auto" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            {/* 数据行 */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4 py-3 border-b">
                <div className="space-y-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-5 w-20 ml-auto" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 加载指示器 - 浮动在右下角 */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3 bg-card border rounded-lg px-4 py-3 shadow-lg animate-pulse">
        <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
        <div className="space-y-1">
          <p className="text-sm font-medium">{message}</p>
          <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-loading-bar"></div>
          </div>
        </div>
      </div>
    </div>
  );
}