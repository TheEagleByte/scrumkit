"use client";

import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface RetroItemData {
  id: string;
  text: string;
  author: string;
  votes: number;
  timestamp: Date;
}

interface RetroItemProps {
  item: RetroItemData;
  onRemove: (itemId: string) => void;
  onVote: (itemId: string) => void;
}

export const RetroItem = memo(function RetroItem({
  item,
  onRemove,
  onVote
}: RetroItemProps) {
  return (
    <Card className="bg-card/50 border-border/50 border">
      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <p className="flex-1 text-sm text-pretty">
            {item.text}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 h-6 w-6 p-0"
            onClick={() => onRemove(item.id)}
            aria-label="Remove item"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            {item.author}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => onVote(item.id)}
          >
            👍 {item.votes}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});