"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import {
  useRetrospective,
  useRetrospectiveColumns,
  useRetrospectiveItems,
  useVotes,
  useCreateItem,
  useDeleteItem,
  useToggleVote,
} from "@/hooks/use-retrospective";
import { useRetrospectiveRealtime } from "@/hooks/use-realtime";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PresenceAvatars } from "@/components/PresenceAvatars";
import { CursorOverlay } from "@/components/CursorOverlay";
import { getCooldownTime } from "@/lib/utils/rate-limit";
import type { Database } from "@/lib/supabase/types-enhanced";

type RetrospectiveColumn = Database["public"]["Tables"]["retrospective_columns"]["Row"];

interface RetrospectiveBoardWithQueryProps {
  retrospectiveId: string;
  currentUser: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  teamName?: string;
  sprintName?: string;
}

interface ColumnConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  type: "went-well" | "improve" | "blockers" | "action-items";
}

const columnConfigs: ColumnConfig[] = [
  {
    id: "went-well",
    type: "went-well",
    title: "What went well?",
    description: "Celebrate successes and positive outcomes",
    icon: <ThumbsUp className="h-5 w-5" />,
    color: "bg-green-500/10 border-green-500/20",
  },
  {
    id: "improve",
    type: "improve",
    title: "What could be improved?",
    description: "Identify areas for enhancement",
    icon: <Lightbulb className="h-5 w-5" />,
    color: "bg-yellow-500/10 border-yellow-500/20",
  },
  {
    id: "blockers",
    type: "blockers",
    title: "What blocked us?",
    description: "Obstacles and impediments faced",
    icon: <AlertTriangle className="h-5 w-5" />,
    color: "bg-red-500/10 border-red-500/20",
  },
  {
    id: "action-items",
    type: "action-items",
    title: "Action items",
    description: "Next steps and commitments",
    icon: <Target className="h-5 w-5" />,
    color: "bg-blue-500/10 border-blue-500/20",
  },
];

export function RetrospectiveBoardWithQuery({
  retrospectiveId,
  currentUser,
  teamName = "Development Team",
  sprintName = "Current Sprint",
}: RetrospectiveBoardWithQueryProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [newItemText, setNewItemText] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());

  // Use TanStack Query hooks
  const { data: retrospective, isLoading: retroLoading } = useRetrospective(retrospectiveId);
  const { data: columns = [], isLoading: columnsLoading } = useRetrospectiveColumns(retrospectiveId);
  const { data: items = [], isLoading: itemsLoading } = useRetrospectiveItems(retrospectiveId);
  const { data: votes = [] } = useVotes(retrospectiveId, items.map(i => i.id));

  // Mutations
  const createItemMutation = useCreateItem();
  const deleteItemMutation = useDeleteItem();
  const toggleVoteMutation = useToggleVote();

  // Set up real-time subscriptions for instant updates
  const { isSubscribed } = useRetrospectiveRealtime(retrospectiveId);

  // Track cooldowns
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns(prev => {
        const next = new Map(prev);
        for (const [key, time] of next.entries()) {
          if (Date.now() > time) {
            next.delete(key);
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleAddItem = async (columnId: string) => {
    if (!newItemText.trim()) {
      toast.error("Please enter some content");
      return;
    }

    const cooldownTime = getCooldownTime("create", currentUser.id);
    if (cooldownTime > 0) {
      setCooldowns(prev => new Map(prev).set(`create-${currentUser.id}`, Date.now() + cooldownTime));
      toast.error(`Please wait ${Math.ceil(cooldownTime / 1000)} seconds`);
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        retrospectiveId,
        columnId,
        content: newItemText,
        authorId: currentUser.id,
        authorName: currentUser.name,
      });

      setNewItemText("");
      setActiveColumn(null);

      // Set cooldown
      const newCooldown = getCooldownTime("create", currentUser.id);
      if (newCooldown > 0) {
        setCooldowns(prev => new Map(prev).set(`create-${currentUser.id}`, Date.now() + newCooldown));
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleDeleteItem = async (itemId: string, authorId: string) => {
    // Check if user is author
    if (authorId !== currentUser.id) {
      toast.error("You can only delete your own items");
      return;
    }

    await deleteItemMutation.mutateAsync({
      itemId,
      retrospectiveId,
      userId: currentUser.id,
    });
  };

  const handleToggleVote = async (itemId: string) => {
    const hasVoted = votes.some(v => v.item_id === itemId && v.user_id === currentUser.id);

    const cooldownTime = getCooldownTime("vote", currentUser.id);
    if (cooldownTime > 0) {
      setCooldowns(prev => new Map(prev).set(`vote-${currentUser.id}`, Date.now() + cooldownTime));
      toast.error(`Please wait ${Math.ceil(cooldownTime / 1000)} seconds`);
      return;
    }

    try {
      await toggleVoteMutation.mutateAsync({
        itemId,
        userId: currentUser.id,
        retrospectiveId,
        hasVoted,
      });

      // Set cooldown
      const newCooldown = getCooldownTime("vote", currentUser.id);
      if (newCooldown > 0) {
        setCooldowns(prev => new Map(prev).set(`vote-${currentUser.id}`, Date.now() + newCooldown));
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getColumnItems = (columnId: string) => {
    return items
      .filter(item => item.column_id === columnId)
      .sort((a, b) => {
        // Sort by votes first, then by date
        const aVotes = votes.filter(v => v.item_id === a.id).length;
        const bVotes = votes.filter(v => v.item_id === b.id).length;
        if (aVotes !== bVotes) return bVotes - aVotes;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  };

  const isLoading = retroLoading || columnsLoading || itemsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading retrospective board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 md:p-8" ref={boardRef}>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">{sprintName}</h1>
          <p className="text-muted-foreground">{teamName}</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus />
          <PresenceAvatars channelName={`retrospective:${retrospectiveId}`} currentUser={currentUser} />
        </div>
      </div>

      {/* Status badges */}
      <div className="mb-4 flex gap-2">
        <Badge variant={isSubscribed ? "default" : "secondary"}>
          {isSubscribed ? "Connected" : "Connecting..."}
        </Badge>
        {cooldowns.has(`create-${currentUser.id}`) && (
          <Badge variant="outline" className="text-orange-500">
            Create cooldown: {Math.ceil((cooldowns.get(`create-${currentUser.id}`)! - Date.now()) / 1000)}s
          </Badge>
        )}
        {cooldowns.has(`vote-${currentUser.id}`) && (
          <Badge variant="outline" className="text-blue-500">
            Vote cooldown: {Math.ceil((cooldowns.get(`vote-${currentUser.id}`)! - Date.now()) / 1000)}s
          </Badge>
        )}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columnConfigs.map((config) => {
          const column = columns.find(c => c.type === config.type);
          if (!column) return null;

          const columnItems = getColumnItems(column.id);

          return (
            <Card key={config.id} className={`${config.color} border`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {config.icon}
                  {config.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {config.description}
                </p>
              </CardHeader>
              <CardContent>
                {/* Add button */}
                {activeColumn === column.id ? (
                  <div className="mb-4">
                    <Textarea
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Type your thoughts..."
                      className="mb-2"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(column.id)}
                        disabled={createItemMutation.isPending || cooldowns.has(`create-${currentUser.id}`)}
                      >
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActiveColumn(null);
                          setNewItemText("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mb-4"
                    onClick={() => setActiveColumn(column.id)}
                    disabled={cooldowns.has(`create-${currentUser.id}`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                )}

                {/* Items */}
                <div className="space-y-2">
                  {columnItems.map((item) => {
                    const itemVotes = votes.filter(v => v.item_id === item.id);
                    const hasVoted = itemVotes.some(v => v.user_id === currentUser.id);
                    const isAuthor = item.author_id === currentUser.id;

                    return (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <p className="text-sm flex-1">{item.content}</p>
                          {isAuthor && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteItem(item.id, item.author_id)}
                              disabled={deleteItemMutation.isPending}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {item.author_name}
                          </span>
                          <Button
                            variant={hasVoted ? "default" : "outline"}
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleToggleVote(item.id)}
                            disabled={toggleVoteMutation.isPending || cooldowns.has(`vote-${currentUser.id}`)}
                          >
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            {itemVotes.length}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cursor tracking overlay */}
      <CursorOverlay
        channelName={`retrospective:${retrospectiveId}`}
        userId={currentUser.id}
        containerRef={boardRef}
      />
    </div>
  );
}