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
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useRetrospectiveRealtime } from "@/hooks/use-realtime";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { PresenceAvatars } from "@/components/PresenceAvatars";
import { CursorOverlay } from "@/components/CursorOverlay";
import type { Database } from "@/lib/supabase/types-enhanced";

type RetrospectiveColumn = Database["public"]["Tables"]["retrospective_columns"]["Row"];

interface RetrospectiveBoardRealtimeProps {
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

export function RetrospectiveBoardRealtime({
  retrospectiveId,
  currentUser,
  teamName = "Development Team",
  sprintName = "Current Sprint",
}: RetrospectiveBoardRealtimeProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const boardRef = useRef<HTMLDivElement>(null);

  const { items, votes, retrospective, isSubscribed } = useRetrospectiveRealtime(retrospectiveId);

  const [columns, setColumns] = useState<RetrospectiveColumn[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const createDefaultColumns = async () => {
      const newColumns: Partial<RetrospectiveColumn>[] = columnConfigs.map((config, index) => ({
        retrospective_id: retrospectiveId,
        title: config.title,
        column_type: config.type,
        order_index: index,
      }));

      const { data, error } = await supabase
        .from("retrospective_columns")
        .insert(newColumns)
        .select();

      if (error) {
        toast({
          title: "Error creating columns",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data || [];
    };

    const loadColumns = async () => {
      const { data, error } = await supabase
        .from("retrospective_columns")
        .select("*")
        .eq("retrospective_id", retrospectiveId)
        .order("order_index");

      if (error) {
        toast({
          title: "Error loading columns",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (!data || data.length === 0) {
        const newColumns = await createDefaultColumns();
        setColumns(newColumns);
      } else {
        setColumns(data);
      }
    };

    const loadUserVotes = async () => {
      const { data, error } = await supabase
        .from("votes")
        .select("item_id")
        .eq("profile_id", currentUser.id);

      if (error) {
        console.error("Error loading user votes:", error);
        return;
      }

      setUserVotes(new Set(data?.map(v => v.item_id) || []));
    };

    loadColumns();
    loadUserVotes();
  }, [retrospectiveId, currentUser.id, supabase, toast]);

  useEffect(() => {
    const votesForUser = votes.filter(v => v.profile_id === currentUser.id);
    setUserVotes(new Set(votesForUser.map(v => v.item_id)));
  }, [votes, currentUser.id]);




  const addItem = async (columnId: string) => {
    if (!newItemText.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const { error } = await supabase
      .from("retrospective_items")
      .insert({
        column_id: columnId,
        content: newItemText.trim(),
        author_id: currentUser.id,
        retrospective_id: retrospectiveId,
      });

    if (error) {
      toast({
        title: "Error adding item",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewItemText("");
      setActiveColumn(null);
      toast({
        title: "Item added",
        description: "Your item has been added to the board",
      });
    }

    setIsSubmitting(false);
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("retrospective_items")
      .delete()
      .eq("id", itemId)
      .eq("author_id", currentUser.id);

    if (error) {
      toast({
        title: "Error removing item",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleVote = async (itemId: string) => {
    if (userVotes.has(itemId)) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("item_id", itemId)
        .eq("profile_id", currentUser.id);

      if (error) {
        toast({
          title: "Error removing vote",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUserVotes(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("votes")
        .insert({
          item_id: itemId,
          profile_id: currentUser.id,
        });

      if (error) {
        toast({
          title: "Error adding vote",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setUserVotes(prev => new Set([...prev, itemId]));
      }
    }
  };

  const getItemsForColumn = (columnId: string) => {
    return items
      .filter(item => item.column_id === columnId)
      .map(item => ({
        ...item,
        voteCount: votes.filter(v => v.item_id === item.id).length,
        hasVoted: userVotes.has(item.id),
      }))
      .sort((a, b) => b.voteCount - a.voteCount);
  };

  const getColumnConfig = (columnType: string) => {
    return columnConfigs.find(c => c.type === columnType) || columnConfigs[0];
  };

  if (!isSubscribed) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4">Connecting to real-time session...</div>
          <ConnectionStatus />
        </div>
      </div>
    );
  }

  return (
    <>
      <CursorOverlay
        channelName={`retrospective:${retrospectiveId}`}
        userId={currentUser.id}
        userName={currentUser.name}
        containerRef={boardRef}
      />

      <div className="container mx-auto max-w-7xl p-6" ref={boardRef}>
        <div className="mb-8 text-center">
          <div className="mb-4 flex items-center justify-between">
            <PresenceAvatars
              channelName={`retrospective:${retrospectiveId}_presence`}
              currentUser={currentUser}
            />
            <ConnectionStatus />
          </div>

          <h1 className="mb-4 text-4xl font-bold text-balance">
            Sprint Retrospective Board
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg text-pretty">
            Reflect on your team&apos;s performance and identify opportunities for
            continuous improvement
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <Badge variant="secondary" className="px-3 py-1">
              {sprintName}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              {teamName}
            </Badge>
            {retrospective?.status && (
              <Badge
                variant={retrospective.status === "active" ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {retrospective.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {columns.map((column) => {
            const config = getColumnConfig(column.column_type);
            const columnItems = getItemsForColumn(column.id);

            return (
              <Card key={column.id} className={`${config.color} border-2`}>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {config.icon}
                    {column.title}
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {config.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {columnItems.map((item) => (
                    <Card
                      key={item.id}
                      className="bg-card/50 border-border/50 border transition-all hover:shadow-md"
                    >
                      <CardContent className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                          <p className="flex-1 text-sm text-pretty">
                            {item.content}
                          </p>
                          {item.author_id === currentUser.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="ml-2 h-6 w-6 p-0"
                              onClick={() => removeItem(item.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            {item.author_id === currentUser.id ? "You" : "Team member"}
                          </span>
                          <Button
                            variant={item.hasVoted ? "default" : "ghost"}
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => toggleVote(item.id)}
                          >
                            👍 {item.voteCount}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {activeColumn === column.id ? (
                    <Card className="bg-card/30 border-2 border-dashed">
                      <CardContent className="space-y-3 p-4">
                        <Textarea
                          placeholder="What would you like to share?"
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          className="min-h-[80px] resize-none"
                          disabled={isSubmitting}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addItem(column.id)}
                            disabled={!newItemText.trim() || isSubmitting}
                          >
                            {isSubmitting ? "Adding..." : "Add Item"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setActiveColumn(null);
                              setNewItemText("");
                            }}
                            disabled={isSubmitting}
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
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm">
            Click 👍 to vote on items • Items are sorted by votes • Changes sync in real-time
          </p>
        </div>
      </div>
    </>
  );
}