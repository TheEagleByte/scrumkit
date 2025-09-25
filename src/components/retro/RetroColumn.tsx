"use client";

import React, { memo, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RetroItem, type RetroItemData } from "./RetroItem";
import { AddItemForm } from "./AddItemForm";

export interface ColumnData {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: RetroItemData[];
}

interface RetroColumnProps {
  column: ColumnData;
  activeColumnId: string | null;
  onActivateColumn: (columnId: string) => void;
  onCancelAdd: () => void;
  onAddItem: (columnId: string, text: string, author: string) => void;
  onRemoveItem: (columnId: string, itemId: string) => void;
  onVoteItem: (columnId: string, itemId: string) => void;
}

export const RetroColumn = memo(function RetroColumn({
  column,
  activeColumnId,
  onActivateColumn,
  onCancelAdd,
  onAddItem,
  onRemoveItem,
  onVoteItem
}: RetroColumnProps) {
  // Memoize sorted items
  const sortedItems = useMemo(() =>
    [...column.items].sort((a, b) => b.votes - a.votes),
    [column.items]
  );

  const handleRemoveItem = useCallback((itemId: string) => {
    onRemoveItem(column.id, itemId);
  }, [column.id, onRemoveItem]);

  const handleVoteItem = useCallback((itemId: string) => {
    onVoteItem(column.id, itemId);
  }, [column.id, onVoteItem]);

  const handleAddItem = useCallback((text: string, author: string) => {
    onAddItem(column.id, text, author);
  }, [column.id, onAddItem]);

  const handleActivateColumn = useCallback(() => {
    onActivateColumn(column.id);
  }, [column.id, onActivateColumn]);

  return (
    <Card className={`${column.color} border-2`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          {column.icon}
          {column.title}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          {column.description}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedItems.map((item) => (
          <RetroItem
            key={item.id}
            item={item}
            onRemove={handleRemoveItem}
            onVote={handleVoteItem}
          />
        ))}

        <AddItemForm
          isActive={activeColumnId === column.id}
          onActivate={handleActivateColumn}
          onCancel={onCancelAdd}
          onAdd={handleAddItem}
        />
      </CardContent>
    </Card>
  );
});