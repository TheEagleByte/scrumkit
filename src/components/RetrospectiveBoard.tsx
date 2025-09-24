"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  X,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  Target,
} from "lucide-react";

interface RetroItem {
  id: string;
  text: string;
  author: string;
  votes: number;
  timestamp: Date;
}

interface Column {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: RetroItem[];
}

export function RetrospectiveBoard() {
  const [columns, setColumns] = useState<Column[]>([
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

  const [newItemText, setNewItemText] = useState("");
  const [newItemAuthor, setNewItemAuthor] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);

  const addItem = (columnId: string) => {
    if (!newItemText.trim() || !newItemAuthor.trim()) return;

    const newItem: RetroItem = {
      id: Date.now().toString(),
      text: newItemText,
      author: newItemAuthor,
      votes: 0,
      timestamp: new Date(),
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, items: [...col.items, newItem] } : col
      )
    );

    setNewItemText("");
    setNewItemAuthor("");
    setActiveColumn(null);
  };

  const removeItem = (columnId: string, itemId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, items: col.items.filter((item) => item.id !== itemId) }
          : col
      )
    );
  };

  const voteItem = (columnId: string, itemId: string) => {
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
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-balance">
          Sprint Retrospective Board
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-pretty">
          Reflect on your team&apos;s performance and identify opportunities for
          continuous improvement
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Badge variant="secondary" className="px-3 py-1">
            Sprint 24
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            Development Team Alpha
          </Badge>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <Card key={column.id} className={`${column.color} border-2`}>
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
              {/* Items */}
              {column.items
                .sort((a, b) => b.votes - a.votes)
                .map((item) => (
                  <Card
                    key={item.id}
                    className="bg-card/50 border-border/50 border"
                  >
                    <CardContent className="p-4">
                      <div className="mb-2 flex items-start justify-between">
                        <p className="flex-1 text-sm text-pretty">
                          {item.text}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                          onClick={() => removeItem(column.id, item.id)}
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
                          onClick={() => voteItem(column.id, item.id)}
                        >
                          👍 {item.votes}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {/* Add new item */}
              {activeColumn === column.id ? (
                <Card className="bg-card/30 border-2 border-dashed">
                  <CardContent className="space-y-3 p-4">
                    <Textarea
                      placeholder="What would you like to share?"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      className="min-h-[80px] resize-none"
                    />
                    <Input
                      placeholder="Your name"
                      value={newItemAuthor}
                      onChange={(e) => setNewItemAuthor(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addItem(column.id)}
                        disabled={!newItemText.trim() || !newItemAuthor.trim()}
                      >
                        Add Item
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveColumn(null);
                          setNewItemText("");
                          setNewItemAuthor("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="ghost"
                  className="border-border/50 h-12 w-full border-2 border-dashed"
                  onClick={() => setActiveColumn(column.id)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add item
                </Button>
              )}
            </CardContent>
          </Card>
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
