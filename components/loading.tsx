import React from "react";

export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingCard({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-lg border border-border">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-border">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-center text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
      ))}
    </div>
  );
}
