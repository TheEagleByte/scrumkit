"use client";

import { usePresence } from "@/hooks/use-realtime";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PresenceAvatarsProps {
  channelName: string;
  currentUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  maxDisplay?: number;
  className?: string;
}

export function PresenceAvatars({
  channelName,
  currentUser,
  maxDisplay = 5,
  className,
}: PresenceAvatarsProps) {
  const { users, activeUsersCount } = usePresence(channelName, currentUser);

  const otherUsers = users.filter((user) => user.id !== currentUser.id);
  const displayUsers = otherUsers.slice(0, maxDisplay);
  const remainingCount = Math.max(0, otherUsers.length - maxDisplay);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isRecentlyActive = (lastSeen: number) => {
    return Date.now() - lastSeen < 60000;
  };

  if (otherUsers.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Users className="h-4 w-4" />
        <span>Just you</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {displayUsers.map((user, index) => (
              <Tooltip key={user.id}>
                <TooltipTrigger asChild>
                  <div
                    className="relative"
                    style={{
                      zIndex: maxDisplay - index,
                    }}
                  >
                    <Avatar
                      className={cn(
                        "h-8 w-8 border-2 border-background transition-transform hover:scale-110",
                        !isRecentlyActive(user.lastSeen) && "opacity-50"
                      )}
                      style={{
                        borderColor: user.color,
                      }}
                    >
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback
                        style={{
                          backgroundColor: user.color + "20",
                          color: user.color,
                        }}
                      >
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    {isRecentlyActive(user.lastSeen) && (
                      <div
                        className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
                        style={{
                          backgroundColor: user.color,
                        }}
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">{user.name}</p>
                    {user.email && (
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {isRecentlyActive(user.lastSeen) ? "Active now" : "Away"}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}

            {remainingCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-muted text-xs font-medium">
                      +{remainingCount}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{remainingCount} more {remainingCount === 1 ? "person" : "people"}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Badge variant="secondary" className="gap-1 px-2 py-0.5">
            <Users className="h-3 w-3" />
            {activeUsersCount} {activeUsersCount === 1 ? "user" : "users"}
          </Badge>
        </div>
      </div>
    </TooltipProvider>
  );
}