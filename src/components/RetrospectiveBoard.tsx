"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  X,
  Check,
  PlayCircle,
  PauseCircle,
  TrendingUp,
  TrendingDown,
  Meh,
  Star,
  Settings2,
  Palette,
} from "lucide-react";
import { DraggableRetroItem } from "@/components/retro/DraggableRetroItem";
import type { RetroItemData } from "@/components/retro/RetroItem";
import type { DraggableItem } from "@/types/drag-and-drop";
import { DroppableColumn } from "@/components/retro/DroppableColumn";
import { VoteCounter } from "@/components/retro/VoteIndicator";
import { Toggle } from "@/components/ui/toggle";
import { ArrowUpDown } from "lucide-react";
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
  useMoveItem,
  useUserVoteStats,
} from "@/hooks/use-retrospective";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useRetrospectiveRealtime } from "@/hooks/use-realtime";
import { Users } from "lucide-react";
import { getCooldownTime } from "@/lib/utils/rate-limit";
import { debounce } from "@/lib/utils/debounce";
import { throttle } from "@/lib/utils/throttle";
import { isAnonymousItemOwner } from "@/lib/boards/anonymous-items";
import { sanitizeItemContent, isValidItemText } from "@/lib/utils/sanitize";
import { ExportDialog } from "@/components/retro/ExportDialog";
import { Download } from "lucide-react";
import { FacilitatorPanel } from "@/components/retro/FacilitatorPanel";
import { Timer } from "@/components/retro/Timer";
import { PhaseManager } from "@/components/retro/PhaseManager";
import { FocusMode } from "@/components/retro/FocusMode";
import {
  useFacilitatorSettings,
  useUpdateFacilitatorSettings,
  useFacilitatorRealtime,
} from "@/hooks/use-facilitator";
import { BoardCustomizationDialog } from "@/components/retro/BoardCustomizationDialog";
import {
  useUpdateRetrospective,
  useUpdateColumn,
  useCreateColumn,
  useDeleteColumn,
} from "@/hooks/use-retrospective";

interface RetrospectiveBoardProps {
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
    'sad': <Meh className="h-5 w-5" />,
    'mad': <Frown className="h-5 w-5" />,
    'liked': <Heart className="h-5 w-5" />,
    'learned': <Lightbulb className="h-5 w-5" />,
    'lacked': <AlertTriangle className="h-5 w-5" />,
    'longed-for': <Star className="h-5 w-5" />,
    'drop': <X className="h-5 w-5" />,
    'add': <Plus className="h-5 w-5" />,
    'keep': <Check className="h-5 w-5" />,
    'start': <PlayCircle className="h-5 w-5" />,
    'stop': <PauseCircle className="h-5 w-5" />,
    'continue': <TrendingUp className="h-5 w-5" />,
    'wind': <TrendingUp className="h-5 w-5" />,
    'anchor': <TrendingDown className="h-5 w-5" />,
    'rocks': <AlertTriangle className="h-5 w-5" />,
    'island': <Target className="h-5 w-5" />,
    'plus': <ThumbsUp className="h-5 w-5" />,
    'delta': <TrendingUp className="h-5 w-5" />,
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

export function RetrospectiveBoard({
  retrospectiveId,
  currentUser,
  teamName = "Development Team",
  sprintName = "Current Sprint",
}: RetrospectiveBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [newItemText, setNewItemText] = useState("");
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());
  const [activeItem, setActiveItem] = useState<RetroItemData | null>(null);
  const [sortByVotes, setSortByVotes] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [facilitatorPanelOpen, setFacilitatorPanelOpen] = useState(false);
  const [customizationDialogOpen, setCustomizationDialogOpen] = useState(false);

  // Use TanStack Query hooks
  const { data: retrospective, isLoading: retroLoading } = useRetrospective(retrospectiveId);
  const { data: columns = [], isLoading: columnsLoading } = useRetrospectiveColumns(retrospectiveId);
  const { data: items = [], isLoading: itemsLoading } = useRetrospectiveItems(retrospectiveId);
  const { data: votes = [] } = useVotes(retrospectiveId, items.map(i => i.id));
  const { data: voteStats } = useUserVoteStats(retrospectiveId, currentUser.id);

  // Mutations
  const createItemMutation = useCreateItem();
  const deleteItemMutation = useDeleteItem();
  const toggleVoteMutation = useToggleVote();
  const updateItemMutation = useUpdateItem();
  const moveItemMutation = useMoveItem();
  const updateRetrospectiveMutation = useUpdateRetrospective();
  const updateColumnMutation = useUpdateColumn();
  const createColumnMutation = useCreateColumn();
  const deleteColumnMutation = useDeleteColumn();

  // Facilitator hooks
  const { data: facilitatorSettings } = useFacilitatorSettings(retrospectiveId);
  const updateFacilitatorSettings = useUpdateFacilitatorSettings();
  useFacilitatorRealtime(retrospectiveId);

  // Set up unified real-time subscriptions
  const realtime = useRetrospectiveRealtime(retrospectiveId, currentUser);

  // Set up drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Track cursor movement with throttling for better performance
  const throttledCursorUpdate = useMemo(
    () => throttle((x: number, y: number) => {
      realtime.updateCursor(x, y);
    }, 16), // ~60fps limit
    [realtime]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Convert pixel coordinates to percentages of viewport
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      throttledCursorUpdate(x, y);
    };

    const handleMouseLeave = () => {
      realtime.updateCursor(-100, -100); // Hide cursor when leaving
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [throttledCursorUpdate, realtime]);

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
    // Validate input
    const validation = isValidItemText(newItemText);
    if (!validation.valid) {
      toast.error(validation.error || "Invalid input");
      return;
    }

    const cooldownTime = getCooldownTime("create", currentUser.id);
    if (cooldownTime > 0) {
      setCooldowns(prev => new Map(prev).set(`create-${currentUser.id}`, Date.now() + cooldownTime));
      toast.error(`Please wait ${Math.ceil(cooldownTime / 1000)} seconds`);
      return;
    }

    // Sanitize the input before saving
    const sanitizedContent = sanitizeItemContent(newItemText);

    try {
      await createItemMutation.mutateAsync({
        retrospectiveId,
        columnId,
        content: sanitizedContent,
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
        // Validate input
        const validation = isValidItemText(newText);
        if (!validation.valid) {
          toast.error(validation.error || "Invalid input");
          return;
        }

        // Sanitize the input before saving
        const sanitizedContent = sanitizeItemContent(newText);

        await updateItemMutation.mutateAsync({
          itemId,
          content: sanitizedContent,
          retrospectiveId,
        });
      }, 500),
    [updateItemMutation, retrospectiveId]
  );


  const getColumnItems = useMemo(
    () => (columnId: string) => {
      // Precompute vote counts once
      const voteCountMap = new Map<string, number>();
      for (const v of votes) {
        voteCountMap.set(v.item_id, (voteCountMap.get(v.item_id) || 0) + 1);
      }

      return items
        .filter(item => item.column_id === columnId)
        .sort((a, b) => {
          const aVotes = voteCountMap.get(a.id) || 0;
          const bVotes = voteCountMap.get(b.id) || 0;

          if (sortByVotes) {
            // Sort by votes first when toggle is on
            if (aVotes !== bVotes) return bVotes - aVotes;
            // Then by position as secondary sort
            const posA = a.position ?? 999;
            const posB = b.position ?? 999;
            if (posA !== posB) return posA - posB;
          } else {
            // Sort by position first, then by votes, then by date
            const posA = a.position ?? 999;
            const posB = b.position ?? 999;
            if (posA !== posB) return posA - posB;
            if (aVotes !== bVotes) return bVotes - aVotes;
          }

          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        });
    },
    [items, votes, sortByVotes]
  );

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current as { item: RetroItemData };
    setActiveItem(activeData?.item || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveItem(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract the actual item ID and column ID from the unique IDs
    const [activeColumnId, activeItemId] = activeId.split("-item-");

    // Check if we're dropping on a column or an item
    let destinationColumnId: string;
    let newPosition: number;

    if (overId.includes("-item-")) {
      // Dropping on an item
      const [overColumnId, overItemId] = overId.split("-item-");
      destinationColumnId = overColumnId;

      const destItems = getColumnItems(destinationColumnId);
      const overIndex = destItems.findIndex(item => item.id === overItemId);

      if (overIndex === -1) {
        setActiveItem(null);
        return;
      }

      // Calculate position based on whether we're moving within same column
      if (activeColumnId === destinationColumnId) {
        const activeIndex = destItems.findIndex(item => item.id === activeItemId);
        if (activeIndex === -1) {
          setActiveItem(null);
          return;
        }

        // If dragging down, insert after; if dragging up, insert before
        newPosition = activeIndex < overIndex ? overIndex : overIndex;
      } else {
        // Moving to different column - insert at the dropped position
        newPosition = overIndex;
      }
    } else {
      // Dropping on a column (empty space or column header)
      destinationColumnId = overId;
      const destItems = getColumnItems(destinationColumnId);
      newPosition = destItems.length; // Add to end
    }

    // Only update if there's an actual change
    const activeItem = items.find(item => item.id === activeItemId);
    if (!activeItem) {
      setActiveItem(null);
      return;
    }

    // Check if we need to update
    const isSameColumn = activeItem.column_id === destinationColumnId;
    const currentItems = getColumnItems(activeItem.column_id);
    const currentIndex = currentItems.findIndex(item => item.id === activeItemId);

    if (isSameColumn && currentIndex === newPosition) {
      setActiveItem(null);
      return; // No change needed
    }

    try {
      await moveItemMutation.mutateAsync({
        itemId: activeItemId,
        sourceColumnId: activeItem.column_id,
        destinationColumnId,
        newPosition,
        retrospectiveId,
      });
    } catch (error) {
      console.error('Failed to move item:', error);
      toast.error("Failed to move item. Please try again.");
      // The optimistic update will be rolled back by the onError handler in useMoveItem
    }

    setActiveItem(null);
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  // Memoize board settings to prevent dialog edits from being wiped during real-time updates
  const boardSettings = useMemo(
    () => ({
      title: retrospective?.title || sprintName,
      is_anonymous: retrospective?.is_anonymous ?? false,
      max_votes_per_user: retrospective?.max_votes_per_user ?? 5,
    }),
    [
      retrospective?.title,
      retrospective?.is_anonymous,
      retrospective?.max_votes_per_user,
      sprintName,
    ]
  );

  const handleSaveCustomization = async (
    settings: {
      title: string;
      is_anonymous: boolean;
      max_votes_per_user: number;
    },
    updatedColumns: Array<{
      id: string;
      title: string;
      description: string | null;
      color: string | null;
      column_type: string;
      display_order: number | null;
    }>
  ) => {
    try {
      // Update retrospective settings
      await updateRetrospectiveMutation.mutateAsync({
        retrospectiveId,
        updates: {
          title: settings.title,
          is_anonymous: settings.is_anonymous,
          max_votes_per_user: settings.max_votes_per_user,
        },
      });

      // Handle column changes
      const existingColumnIds = columns.map((c) => c.id);
      const updatedColumnIds = updatedColumns.map((c) => c.id);

      // Delete removed columns (run in parallel)
      const deletedColumns = existingColumnIds.filter(
        (id) => !updatedColumnIds.includes(id)
      );
      await Promise.all(
        deletedColumns.map((columnId) =>
          deleteColumnMutation.mutateAsync({
            columnId,
            retrospectiveId,
          })
        )
      );

      // Separate creates and updates for parallel processing
      const columnsToCreate = updatedColumns.filter((col) =>
        col.id.startsWith("temp-")
      );
      const columnsToUpdate = updatedColumns.filter(
        (col) => !col.id.startsWith("temp-")
      );

      // Run creates and updates in parallel batches
      await Promise.all([
        ...columnsToCreate.map((column) =>
          createColumnMutation.mutateAsync({
            retrospectiveId,
            title: column.title,
            description: column.description,
            color: column.color,
            column_type: column.column_type,
            display_order: column.display_order || 0,
          })
        ),
        ...columnsToUpdate.map((column) =>
          updateColumnMutation.mutateAsync({
            columnId: column.id,
            retrospectiveId,
            updates: {
              title: column.title,
              description: column.description,
              color: column.color,
              display_order: column.display_order,
            },
          })
        ),
      ]);

      toast.success("Board customization saved successfully!");
    } catch (error) {
      console.error("Failed to save customization:", error);
      toast.error("Failed to save customization. Please try again.");
    }
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="relative min-h-screen p-4 pt-24 md:px-8 md:pt-24 md:pb-8" ref={boardRef}>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {retrospective?.title || sprintName}
          </h1>
          <p className="text-muted-foreground">{teamName}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Facilitator State Indicators */}
          {facilitatorSettings?.timer && facilitatorSettings.timer.duration > 0 && (
            <Timer
              initialState={facilitatorSettings.timer}
              compact
            />
          )}
          {facilitatorSettings?.phase && (
            <PhaseManager
              currentPhase={facilitatorSettings.phase}
              compact
            />
          )}
          {facilitatorSettings?.focusedColumnId && (
            <FocusMode
              columns={columns.map(col => ({
                id: col.id,
                title: col.title,
                color: col.color || undefined,
              }))}
              focusedColumnId={facilitatorSettings.focusedColumnId}
              compact
            />
          )}

          {/* Vote Counter */}
          {voteStats && !currentUser.id.startsWith("anon-") && (
            <div className="w-32">
              <VoteCounter
                votesUsed={voteStats.votesUsed}
                maxVotes={voteStats.maxVotes}
              />
            </div>
          )}

          {/* Sort Toggle */}
          <Toggle
            pressed={sortByVotes}
            onPressedChange={setSortByVotes}
            aria-label="Toggle vote sorting"
            size="sm"
            className="gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort by votes
          </Toggle>

          {/* Customize Board Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomizationDialogOpen(true)}
            className="gap-1"
          >
            <Palette className="h-4 w-4" />
            Customize
          </Button>

          {/* Facilitator Tools Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFacilitatorPanelOpen(true)}
            className="gap-1"
          >
            <Settings2 className="h-4 w-4" />
            Facilitator Tools
          </Button>

          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportDialogOpen(true)}
            className="gap-1"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Badge variant={realtime.connectionStatus === "connected" ? "default" : "secondary"}>
            {realtime.connectionStatus === "connected" ? "Connected" : "Connecting..."}
          </Badge>
          <div className="flex items-center gap-2">
            {realtime.otherUsers.length === 0 ? (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <Users className="h-4 w-4" />
                    <span>Just you</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Active Users</div>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                        style={{ backgroundColor: realtime.myPresenceState?.color || '#6B7280' }}
                      >
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{currentUser.name} (You)</div>
                        {currentUser.email && (
                          <div className="text-xs text-muted-foreground">{currentUser.email}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge variant="secondary" className="gap-1 px-2 py-0.5 cursor-pointer">
                    <Users className="h-3 w-3" />
                    {realtime.activeUsersCount} {realtime.activeUsersCount === 1 ? "user" : "users"}
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Active Users ({realtime.activeUsersCount})</div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {/* Current user */}
                      <div className="flex items-center gap-3 pb-2 border-b">
                        {currentUser.avatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback
                              style={{ backgroundColor: realtime.myPresenceState?.color || '#6B7280' }}
                            >
                              {currentUser.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                            style={{ backgroundColor: realtime.myPresenceState?.color || '#6B7280' }}
                          >
                            {currentUser.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{currentUser.name} (You)</div>
                          {currentUser.email && (
                            <div className="text-xs text-muted-foreground">{currentUser.email}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                      </div>
                      {/* Other users */}
                      {realtime.otherUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3">
                          {user.avatar ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback
                                style={{ backgroundColor: user.color || '#6B7280' }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div
                              className="h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold text-xs"
                              style={{ backgroundColor: user.color || '#6B7280' }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{user.name}</div>
                            {user.email && (
                              <div className="text-xs text-muted-foreground">{user.email}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
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
          const itemIds = columnItems.map(item => `${column.id}-item-${item.id}`);

          // Apply focus mode styling
          const isFocused = facilitatorSettings?.focusedColumnId === column.id;
          const hasFocus = !!facilitatorSettings?.focusedColumnId;
          const isDimmed = hasFocus && !isFocused;

          return (
            <Card
              key={column.id}
              className={`${column.color || getColumnColor(index)} border relative transition-opacity duration-300 ${
                isDimmed ? 'opacity-40' : 'opacity-100'
              } ${isFocused ? 'ring-2 ring-primary shadow-lg' : ''}`}
            >
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
                <DroppableColumn id={column.id} items={itemIds}>
                  <div className="space-y-2">
                    {columnItems.map((item) => {
                      const itemVotes = votes.filter(v => v.item_id === item.id);
                      const hasVoted = itemVotes.some(v => v.profile_id === currentUser.id);

                      // Check authorship for both authenticated and anonymous users
                      const isAuthor = currentUser.id.startsWith("anon-")
                        ? isAnonymousItemOwner(item.id, currentUser.id)
                        : !!(item.author_id && item.author_id === currentUser.id);

                      // Check if user can vote
                      let canVote = false;
                      if (!currentUser.id.startsWith("anon-")) {
                        if (hasVoted) {
                          canVote = true; // Can always remove vote
                        } else {
                          canVote = voteStats ? voteStats.votesRemaining > 0 : true;
                        }
                      }

                      const retroItem: DraggableItem & { hasVoted?: boolean; canVote?: boolean } = {
                        id: item.id,
                        text: item.text,
                        author: item.author_name,
                        votes: itemVotes.length,
                        timestamp: new Date(item.created_at || Date.now()),
                        color: item.color,
                        uniqueId: `${column.id}-item-${item.id}`,
                        hasVoted,
                        canVote,
                      };

                      return (
                        <DraggableRetroItem
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
                </DroppableColumn>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cursor tracking overlay */}
      {Array.from(realtime.cursors.entries()).map(([userId, cursor]) => {
        // Convert percentage coordinates back to pixels
        const pixelX = cursor.x < 0 ? -100 : (cursor.x * window.innerWidth) / 100;
        const pixelY = cursor.y < 0 ? -100 : (cursor.y * window.innerHeight) / 100;

        return (
          <div
            key={userId}
            className="pointer-events-none fixed z-50 transition-all duration-150 ease-out"
            style={{
              left: pixelX,
              top: pixelY,
              transform: "translate(-4px, -4px)",
              opacity: cursor.x < 0 || cursor.y < 0 ? 0 : 1,
            }}
        >
          <div className="flex items-start gap-1">
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
            {cursor.name && (
              <span
                className="mt-3 rounded-sm px-1 py-0.5 text-xs font-medium text-white shadow-sm"
                style={{
                  backgroundColor: cursor.color,
                }}
              >
                {cursor.name}
              </span>
            )}
            </div>
          </div>
        );
      })}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem && (
          <div className="w-80 opacity-90">
            <Card className="border-border/50 border bg-card/95 shadow-lg">
              <CardContent className="p-4">
                <div className="mb-2">
                  <p className="text-sm">{activeItem.text}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {activeItem.author}
                  </span>
                  <span className="text-xs">
                    👍 {activeItem.votes}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DragOverlay>

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        exportData={{
          retrospectiveName: retrospective?.title ?? 'Retrospective',
          teamName,
          sprintName: retrospective?.sprint_name ?? sprintName,
          date: retrospective?.created_at
            ? new Date(retrospective.created_at)
            : new Date(),
          columns,
          items,
          votes,
        }}
      />

      {/* Facilitator Panel */}
      {facilitatorSettings && (
        <FacilitatorPanel
          open={facilitatorPanelOpen}
          onOpenChange={setFacilitatorPanelOpen}
          settings={facilitatorSettings}
          onSettingsChange={(newSettings) => {
            updateFacilitatorSettings.mutate({
              retrospectiveId,
              settings: newSettings,
            });
          }}
          columns={columns.map(col => ({
            id: col.id,
            title: col.title,
            color: col.color || undefined,
          }))}
        />
      )}

      {/* Board Customization Dialog */}
      <BoardCustomizationDialog
        open={customizationDialogOpen}
        onOpenChange={setCustomizationDialogOpen}
        boardSettings={boardSettings}
        columns={columns}
        onSave={handleSaveCustomization}
        isLoading={
          updateRetrospectiveMutation.isPending ||
          updateColumnMutation.isPending ||
          createColumnMutation.isPending ||
          deleteColumnMutation.isPending
        }
      />
    </div>
    </DndContext>
  );
}