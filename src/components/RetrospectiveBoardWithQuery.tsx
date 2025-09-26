"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  Target,
  Heart,
  Frown,
  Smile,
  MessageSquare,
} from "lucide-react";
import { RetroItem, type RetroItemData } from "@/components/retro/RetroItem";
import { toast } from "sonner";
import {
  useRetrospective,
  useRetrospectiveColumns,
  useRetrospectiveItems,
  useVotes,
  useCreateItem,
  useDeleteItem,
  useToggleVote,
  useUpdateItem,
} from "@/hooks/use-retrospective";
import { useUnifiedRetrospectiveRealtime } from "@/hooks/use-retrospective-realtime-unified";
import { Users } from "lucide-react";
import { getCooldownTime } from "@/lib/utils/rate-limit";
import { debounce } from "@/lib/utils/debounce";
import { isAnonymousItemOwner } from "@/lib/boards/anonymous-items";

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

// Icon mapping for different column types
const getColumnIcon = (columnType: string): React.ReactNode => {
  const iconMap: Record<string, React.ReactNode> = {
    'went-well': <ThumbsUp className="h-5 w-5" />,
    'improve': <Lightbulb className="h-5 w-5" />,
    'blockers': <AlertTriangle className="h-5 w-5" />,
    'action-items': <Target className="h-5 w-5" />,
    'glad': <Smile className="h-5 w-5" />,
    'sad': <Frown className="h-5 w-5" />,
    'mad': <AlertTriangle className="h-5 w-5" />,
    'liked': <Heart className="h-5 w-5" />,
    'learned': <Lightbulb className="h-5 w-5" />,
    'lacked': <AlertTriangle className="h-5 w-5" />,
    'longed-for': <Target className="h-5 w-5" />,
  };
  return iconMap[columnType] || <MessageSquare className="h-5 w-5" />;
};

// Default colors for columns based on index
const getColumnColor = (index: number): string => {
  const colors = [
    "bg-green-500/10 border-green-500/20",
    "bg-yellow-500/10 border-yellow-500/20",
    "bg-red-500/10 border-red-500/20",
    "bg-blue-500/10 border-blue-500/20",
    "bg-purple-500/10 border-purple-500/20",
    "bg-pink-500/10 border-pink-500/20",
  ];
  return colors[index % colors.length];
};

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
  const { isLoading: retroLoading } = useRetrospective(retrospectiveId);
  const { data: columns = [], isLoading: columnsLoading } = useRetrospectiveColumns(retrospectiveId);
  const { data: items = [], isLoading: itemsLoading } = useRetrospectiveItems(retrospectiveId);
  const { data: votes = [] } = useVotes(retrospectiveId, items.map(i => i.id));

  // Mutations
  const createItemMutation = useCreateItem();
  const deleteItemMutation = useDeleteItem();
  const toggleVoteMutation = useToggleVote();
  const updateItemMutation = useUpdateItem();

  // Set up unified real-time subscriptions
  const realtime = useUnifiedRetrospectiveRealtime(retrospectiveId, currentUser);

  // Track cursor movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      realtime.updateCursor(e.clientX, e.clientY);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [realtime]);

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
      console.error('Failed to add item:', error);
      // Error toast is handled by the mutation
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    // Note: Authorization is now checked in the UI by only showing
    // delete button to authors. The actual check happens when determining isAuthor.
    await deleteItemMutation.mutateAsync({
      itemId,
      retrospectiveId,
      userId: currentUser.id,
    });
  };

  const handleToggleVote = async (itemId: string) => {
    const hasVoted = votes.some(v => v.item_id === itemId && v.profile_id === currentUser.id);

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
      console.error('Failed to toggle vote:', error);
      // Error toast is handled by the mutation
    }
  };

  const handleEditItem = useMemo(
    () =>
      debounce(async (itemId: string, newText: string) => {
        await updateItemMutation.mutateAsync({
          itemId,
          content: newText,
          retrospectiveId,
        });
      }, 500),
    [updateItemMutation, retrospectiveId]
  );


  const getColumnItems = useMemo(
    () => (columnId: string) => {
      return items
        .filter(item => item.column_id === columnId)
        .sort((a, b) => {
          // Sort by votes first, then by date
          const aVotes = votes.filter(v => v.item_id === a.id).length;
          const bVotes = votes.filter(v => v.item_id === b.id).length;
          if (aVotes !== bVotes) return bVotes - aVotes;
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    },
    [items, votes]
  );

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
          <Badge variant={realtime.connectionStatus === "connected" ? "default" : "secondary"}>
            {realtime.connectionStatus === "connected" ? "Connected" : "Connecting..."}
          </Badge>
          <div className="flex items-center gap-2">
            {realtime.otherUsers.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Just you</span>
              </div>
            ) : (
              <Badge variant="secondary" className="gap-1 px-2 py-0.5">
                <Users className="h-3 w-3" />
                {realtime.activeUsersCount} {realtime.activeUsersCount === 1 ? "user" : "users"}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Cooldown badges */}
      <div className="mb-4 flex gap-2">
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
      <div className={`grid grid-cols-1 md:grid-cols-2 ${columns.length > 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
        {columns.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((column, index) => {
          const columnItems = getColumnItems(column.id);

          return (
            <Card key={column.id} className={`${column.color || getColumnColor(index)} border`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {getColumnIcon(column.column_type)}
                  {column.title}
                </CardTitle>
                {column.description && (
                  <p className="text-sm text-muted-foreground">
                    {column.description}
                  </p>
                )}
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

                    // Check authorship for both authenticated and anonymous users
                    const isAuthor = currentUser.id.startsWith("anon-")
                      ? isAnonymousItemOwner(item.id, currentUser.id)
                      : !!(item.author_id && item.author_id === currentUser.id);

                    const retroItem: RetroItemData = {
                      id: item.id,
                      text: item.text,
                      author: item.author_name,
                      votes: itemVotes.length,
                      timestamp: new Date(item.created_at || Date.now()),
                      color: item.color,
                    };

                    return (
                      <RetroItem
                        key={item.id}
                        item={retroItem}
                        onRemove={() => handleDeleteItem(item.id)}
                        onVote={() => handleToggleVote(item.id)}
                        onEdit={isAuthor ? handleEditItem : undefined}
                        isAuthor={isAuthor}
                      />
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cursor tracking overlay */}
      {Array.from(realtime.cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="pointer-events-none fixed z-50"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-4px, -4px)",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
              fill={cursor.color}
              stroke="white"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}