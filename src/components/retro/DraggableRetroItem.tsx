"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RetroItem, type RetroItemData } from "./RetroItem";
import { GripVertical } from "lucide-react";

interface DraggableRetroItemProps {
  item: RetroItemData & { uniqueId: string };
  onRemove: (itemId: string) => void;
  onVote: (itemId: string) => void;
  onEdit?: (itemId: string, newText: string) => void;
  isAuthor?: boolean;
}

export const DraggableRetroItem = React.memo(function DraggableRetroItem({
  item,
  onRemove,
  onVote,
  onEdit,
  isAuthor = false
}: DraggableRetroItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.uniqueId,
    data: {
      type: "item",
      item: item
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
        aria-label="Drag handle"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <RetroItem
        item={item}
        onRemove={onRemove}
        onVote={onVote}
        onEdit={onEdit}
        isAuthor={isAuthor}
      />
    </div>
  );
});