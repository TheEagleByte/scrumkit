"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

interface DroppableColumnProps {
  id: string;
  items: string[];
  children: React.ReactNode;
}

export function DroppableColumn({ id, items, children }: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] transition-colors ${
        isOver ? "bg-primary/5 rounded-lg" : ""
      }`}
    >
      {items.length > 0 ? (
        <SortableContext
          items={items}
          strategy={verticalListSortingStrategy}
          id={id}
        >
          {children}
        </SortableContext>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}