"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings2, Plus, Trash2, GripVertical, Palette } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const AVAILABLE_COLORS = [
  { value: "bg-green-500/10 border-green-500/20", label: "Green", preview: "bg-green-500" },
  { value: "bg-yellow-500/10 border-yellow-500/20", label: "Yellow", preview: "bg-yellow-500" },
  { value: "bg-red-500/10 border-red-500/20", label: "Red", preview: "bg-red-500" },
  { value: "bg-blue-500/10 border-blue-500/20", label: "Blue", preview: "bg-blue-500" },
  { value: "bg-purple-500/10 border-purple-500/20", label: "Purple", preview: "bg-purple-500" },
  { value: "bg-orange-500/10 border-orange-500/20", label: "Orange", preview: "bg-orange-500" },
  { value: "bg-pink-500/10 border-pink-500/20", label: "Pink", preview: "bg-pink-500" },
  { value: "bg-cyan-500/10 border-cyan-500/20", label: "Cyan", preview: "bg-cyan-500" },
];

interface BoardColumn {
  id: string;
  title: string;
  description: string | null;
  color: string | null;
  column_type: string;
  display_order: number | null;
}

interface BoardSettings {
  title: string;
  is_anonymous: boolean;
  max_votes_per_user: number;
}

interface BoardCustomizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardSettings: BoardSettings;
  columns: BoardColumn[];
  onSave: (settings: BoardSettings, columns: BoardColumn[]) => void;
  isLoading?: boolean;
}

interface SortableColumnItemProps {
  column: BoardColumn;
  onUpdate: (id: string, updates: Partial<BoardColumn>) => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
}

function SortableColumnItem({ column, onUpdate, onDelete, canDelete }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={`${column.color || "bg-gray-500/10 border-gray-500/20"}`}>
        <CardHeader className="pb-3 pt-3">
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-move"
              {...attributes}
              {...listeners}
              type="button"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <div className="flex-1 space-y-2">
              <Input
                value={column.title}
                onChange={(e) => onUpdate(column.id, { title: e.target.value })}
                placeholder="Column title"
                className="font-semibold"
              />
              <Textarea
                value={column.description || ""}
                onChange={(e) => onUpdate(column.id, { description: e.target.value })}
                placeholder="Column description (optional)"
                className="min-h-[60px] text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete(column.id)}
              disabled={!canDelete}
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          <div className="space-y-2">
            <Label className="text-xs">Color Scheme</Label>
            <Select
              value={column.color || undefined}
              onValueChange={(value) => onUpdate(column.id, { color: value })}
            >
              <SelectTrigger className="h-8">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-3 w-3 rounded ${
                        AVAILABLE_COLORS.find((c) => c.value === column.color)
                          ?.preview || "bg-gray-500"
                      }`}
                    />
                    {AVAILABLE_COLORS.find((c) => c.value === column.color)
                      ?.label || "Select color"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded ${color.preview}`} />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function BoardCustomizationDialog({
  open,
  onOpenChange,
  boardSettings,
  columns: initialColumns,
  onSave,
  isLoading = false,
}: BoardCustomizationDialogProps) {
  const [settings, setSettings] = useState<BoardSettings>(boardSettings);
  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [hasChanges, setHasChanges] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sync with external changes
  useEffect(() => {
    setSettings(boardSettings);
  }, [boardSettings]);

  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  // Track changes
  useEffect(() => {
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(boardSettings);
    const columnsChanged = JSON.stringify(columns) !== JSON.stringify(initialColumns);
    setHasChanges(settingsChanged || columnsChanged);
  }, [settings, columns, boardSettings, initialColumns]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update display_order
        return newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }));
      });
    }
  };

  const handleAddColumn = () => {
    if (columns.length >= 6) {
      toast.error("Maximum 6 columns allowed");
      return;
    }

    const newColumn: BoardColumn = {
      id: `temp-${crypto.randomUUID()}`,
      title: "New Column",
      description: "",
      color: AVAILABLE_COLORS[columns.length % AVAILABLE_COLORS.length].value,
      column_type: `custom-${crypto.randomUUID()}`,
      display_order: columns.length,
    };
    setColumns([...columns, newColumn]);
  };

  const handleUpdateColumn = (id: string, updates: Partial<BoardColumn>) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === id ? { ...col, ...updates } : col))
    );
  };

  const handleDeleteColumn = (id: string) => {
    if (columns.length <= 1) {
      toast.error("At least one column is required");
      return;
    }
    setColumns((prev) =>
      prev
        .filter((col) => col.id !== id)
        .map((col, index) => ({ ...col, display_order: index }))
    );
  };

  const handleSave = async () => {
    // Validate
    if (!settings.title.trim()) {
      toast.error("Board title is required");
      return;
    }

    if (columns.some((col) => !col.title.trim())) {
      toast.error("All columns must have a title");
      return;
    }

    if (settings.max_votes_per_user < 1 || settings.max_votes_per_user > 50) {
      toast.error("Votes per user must be between 1 and 50");
      return;
    }

    try {
      await onSave(settings, columns);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      // Keep dialog open for retry
    }
  };

  const handleCancel = () => {
    setSettings(boardSettings);
    setColumns(initialColumns);
    setHasChanges(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Customize Board
          </DialogTitle>
          <DialogDescription>
            Customize your retrospective board to fit your team&apos;s needs
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="columns">
              <Palette className="h-4 w-4 mr-2" />
              Columns
            </TabsTrigger>
            <TabsTrigger value="voting">Voting & Access</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto py-4">
            <TabsContent value="general" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="board-title">Board Title</Label>
                <Input
                  id="board-title"
                  value={settings.title}
                  onChange={(e) =>
                    setSettings({ ...settings, title: e.target.value })
                  }
                  placeholder="e.g., Sprint 23 Retrospective"
                />
              </div>
            </TabsContent>

            <TabsContent value="columns" className="space-y-4 mt-0">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Columns ({columns.length})</Label>
                  <p className="text-xs text-muted-foreground">
                    Drag to reorder, edit titles and colors
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddColumn}
                  disabled={columns.length >= 6}
                  type="button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Column
                </Button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {columns.map((column) => (
                    <SortableColumnItem
                      key={column.id}
                      column={column}
                      onUpdate={handleUpdateColumn}
                      onDelete={handleDeleteColumn}
                      canDelete={columns.length > 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </TabsContent>

            <TabsContent value="voting" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-votes">
                    Maximum Votes Per User
                  </Label>
                  <Input
                    id="max-votes"
                    type="number"
                    min={1}
                    max={50}
                    value={settings.max_votes_per_user}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        max_votes_per_user: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Set how many votes each participant can cast (1-50)
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="anonymous-mode">Anonymous Mode</Label>
                      <p className="text-xs text-muted-foreground">
                        Hide author names on retrospective items
                      </p>
                    </div>
                    <Switch
                      id="anonymous-mode"
                      checked={settings.is_anonymous}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, is_anonymous: checked })
                      }
                    />
                  </div>
                  {!settings.is_anonymous && boardSettings.is_anonymous && (
                    <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">
                        ⚠️ Disabling anonymous mode will reveal author names on existing items
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isLoading}
            type="button"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
