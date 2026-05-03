import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 48,
  message = "Loading...",
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className={`h-[${size}px] w-[${size}px] animate-spin text-primary`} />
      <Skeleton className="h-6 w-32" />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  );
};