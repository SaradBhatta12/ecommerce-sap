"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowUpIcon,
  ArrowDownIcon
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  description,
  trend,
  className,
  loading = false,
}: MetricCardProps) {
  const getTrendIcon = () => {
    if (change === undefined) return null;
    
    if (change > 0) return <ArrowUpIcon className="h-3 w-3" />;
    if (change < 0) return <ArrowDownIcon className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change === undefined) return "text-muted-foreground";
    
    if (change > 0) return "text-green-600 dark:text-green-400";
    if (change < 0) return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  const getBadgeVariant = () => {
    if (change === undefined) return "secondary";
    
    if (change > 0) return "default";
    if (change < 0) return "destructive";
    return "secondary";
  };

  if (loading) {
    return (
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          </CardTitle>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              <Badge 
                variant={getBadgeVariant()}
                className={cn(
                  "flex items-center space-x-1 text-xs",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </Badge>
            </div>
          )}
        </div>
        
        {changeLabel && (
          <p className="text-xs text-muted-foreground mt-2">
            {changeLabel}
          </p>
        )}
      </CardContent>
      
      {/* Gradient overlay for visual appeal */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-primary/5 pointer-events-none" />
    </Card>
  );
}