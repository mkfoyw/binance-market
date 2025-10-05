import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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

export function LoadingState({ count = 3 }: LoadingStateProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Skeleton className="h-8 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LoadingCard count={count} />
      </div>
    </div>
  );
}