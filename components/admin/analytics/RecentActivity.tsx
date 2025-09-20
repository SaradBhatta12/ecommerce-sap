"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  ShoppingCart,
  User,
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "order" | "user" | "product" | "sale";
  title: string;
  description: string;
  timestamp: Date | string;
  status?: "success" | "warning" | "error" | "info";
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  metadata?: {
    amount?: number;
    quantity?: number;
    category?: string;
  };
}

interface RecentActivityProps {
  activities: ActivityItem[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
}

export function RecentActivity({
  activities,
  loading = false,
  className,
  maxItems = 10,
}: RecentActivityProps) {
  const getActivityIcon = (type: string, status?: string) => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
      case "order":
        return <ShoppingCart className={iconClass} />;
      case "user":
        return <User className={iconClass} />;
      case "product":
        return <Package className={iconClass} />;
      case "sale":
        return <TrendingUp className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getStatusIcon = (status?: string) => {
    const iconClass = "h-3 w-3";
    
    switch (status) {
      case "success":
        return <CheckCircle className={cn(iconClass, "text-green-500")} />;
      case "warning":
        return <AlertCircle className={cn(iconClass, "text-yellow-500")} />;
      case "error":
        return <XCircle className={cn(iconClass, "text-red-500")} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        <CardDescription>
          Latest updates and activities across your platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  "flex items-start space-x-3 p-3 rounded-lg transition-colors hover:bg-muted/50",
                  index !== displayActivities.length - 1 && "border-b border-border/50"
                )}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                </div>

                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    {activity.status && getStatusIcon(activity.status)}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {activity.description}
                  </p>

                  {/* User Info */}
                  {activity.user && (
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {activity.user.name}
                      </span>
                    </div>
                  )}

                  {/* Metadata */}
                  {activity.metadata && (
                    <div className="flex items-center space-x-2 mb-2">
                      {activity.metadata.amount && (
                        <Badge variant="outline" className="text-xs">
                          ${activity.metadata.amount.toLocaleString()}
                        </Badge>
                      )}
                      {activity.metadata.quantity && (
                        <Badge variant="outline" className="text-xs">
                          Qty: {activity.metadata.quantity}
                        </Badge>
                      )}
                      {activity.metadata.category && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.metadata.category}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <div className="flex-shrink-0 text-right">
                  <p className={cn("text-xs", getStatusColor(activity.status))}>
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > maxItems && (
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              Showing {maxItems} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}