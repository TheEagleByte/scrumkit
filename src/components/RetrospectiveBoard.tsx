"use client";

import type React from "react";
import { useState, useCallback } from "react";
import { ThumbsUp, Lightbulb, AlertTriangle, Target } from "lucide-react";
import { BoardHeader } from "./retro/BoardHeader";
import { RetroColumn, type ColumnData } from "./retro/RetroColumn";
import type { RetroItemData } from "./retro/RetroItem";

export function RetrospectiveBoard() {
  const [columns, setColumns] = useState<ColumnData[]>([
    {
      id: "went-well",
      title: "What went well?",
      description: "Celebrate successes and positive outcomes",
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-green-500/10 border-green-500/20",
      items: [
        {
          id: "1",
          text: "Successfully delivered the user authentication feature ahead of schedule",
          author: "Sarah Chen",
          votes: 5,
          timestamp: new Date(),
        },
        {
          id: "2",
          text: "Great collaboration between frontend and backend teams",
          author: "Mike Johnson",
          votes: 3,
          timestamp: new Date(),
        },
      ],
    },
    {
      id: "improve",
      title: "What could be improved?",
      description: "Identify areas for enhancement",
      icon: <Lightbulb className="h-5 w-5" />,
      color: "bg-yellow-500/10 border-yellow-500/20",
      items: [
        {
          id: "3",
          text: "Code review process took longer than expected",
          author: "Alex Rivera",
          votes: 4,
          timestamp: new Date(),
        },
        {
          id: "4",
          text: "Need better documentation for API endpoints",
          author: "Emma Davis",
          votes: 2,
          timestamp: new Date(),
        },
      ],
    },
    {
      id: "blockers",
      title: "What blocked us?",
      description: "Obstacles and impediments faced",
      icon: <AlertTriangle className="h-5 w-5" />,
      color: "bg-red-500/10 border-red-500/20",
      items: [
        {
          id: "5",
          text: "Third-party API downtime affected testing",
          author: "David Kim",
          votes: 6,
          timestamp: new Date(),
        },
      ],
    },
    {
      id: "action-items",
      title: "Action items",
      description: "Next steps and commitments",
      icon: <Target className="h-5 w-5" />,
      color: "bg-blue-500/10 border-blue-500/20",
      items: [
        {
          id: "6",
          text: "Set up automated code review reminders",
          author: "Team Decision",
          votes: 0,
          timestamp: new Date(),
        },
      ],
    },
  ]);

  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const handleAddItem = useCallback((columnId: string, text: string, author: string) => {
    const newItem: RetroItemData = {
      id: Date.now().toString(),
      text,
      author,
      votes: 0,
      timestamp: new Date(),
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, items: [...col.items, newItem] } : col
      )
    );

    setActiveColumn(null);
  }, []);

  const handleRemoveItem = useCallback((columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, items: col.items.filter((item) => item.id !== itemId) }
          : col
      )
    );
  }, []);

  const handleVoteItem = useCallback((columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? {
              ...col,
              items: col.items.map((item) =>
                item.id === itemId ? { ...item, votes: item.votes + 1 } : item
              ),
            }
          : col
      )
    );
  }, []);

  const handleActivateColumn = useCallback((columnId: string) => {
    setActiveColumn(columnId);
  }, []);

  const handleCancelAdd = useCallback(() => {
    setActiveColumn(null);
  }, []);

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <BoardHeader />

      {/* Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <RetroColumn
            key={column.id}
            column={column}
            activeColumnId={activeColumn}
            onActivateColumn={handleActivateColumn}
            onCancelAdd={handleCancelAdd}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onVoteItem={handleVoteItem}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <p className="text-muted-foreground text-sm">
          Click 👍 to vote on items • Items are sorted by votes • Add your
          thoughts to drive team improvement
        </p>
      </div>
    </div>
  );
}
