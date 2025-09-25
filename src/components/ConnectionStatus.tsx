"use client";

import { useConnectionStatus } from "@/hooks/use-realtime";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function ConnectionStatus() {
  const { status, retryCount, reconnect, lastError } = useConnectionStatus();

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      case "disconnected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Wifi className="h-4 w-4" />;
      case "connecting":
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case "disconnected":
        return <WifiOff className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return `Connecting${retryCount > 0 ? ` (Retry ${retryCount})` : ""}`;
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const getTooltipContent = () => {
    if (status === "connected") {
      return "Real-time updates active";
    }
    if (status === "connecting") {
      return `Establishing connection${retryCount > 0 ? ` (attempt ${retryCount})` : ""}`;
    }
    if (status === "disconnected") {
      return lastError ? `Connection lost: ${lastError.message}` : "Connection lost";
    }
    return "Connection status unknown";
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                status === "connected" && "bg-green-500/10 text-green-700 dark:text-green-400",
                status === "connecting" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                status === "disconnected" && "bg-red-500/10 text-red-700 dark:text-red-400"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    getStatusColor(),
                    status === "connecting" && "animate-pulse"
                  )}
                />
                {status === "connected" && (
                  <div
                    className={cn(
                      "absolute inset-0 h-2 w-2 rounded-full",
                      getStatusColor(),
                      "animate-ping"
                    )}
                  />
                )}
              </div>
              <span className="flex items-center gap-1">
                {getStatusIcon()}
                {getStatusText()}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>

        {status === "disconnected" && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="h-7 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Retry connection</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}