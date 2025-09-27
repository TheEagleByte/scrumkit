"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { BoardColumn } from "@/lib/boards/templates";
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

const AVAILABLE_ICONS = [
  "ThumbsUp",
  "ThumbsDown",
  "Heart",
  "Star",
  "Lightbulb",
  "AlertTriangle",
  "Target",
  "TrendingUp",
  "TrendingDown",
  "MessageSquare",
  "Check",
  "X",
  "Plus",
  "PlayCircle",
  "PauseCircle",
  "Smile",
  "Frown",
  "Meh",
];

interface SortableColumnItemProps {
  column: BoardColumn;
  index: number;
  onUpdate: (index: number, column: BoardColumn) => void;
  onDelete: (index: number) => void;
}

function SortableColumnItem({ column, index, onUpdate, onDelete }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: column.column_type });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="mb-3"
    >
      <Card className={`${column.color}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 cursor-move"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <div className="flex-1 space-y-2">
              <Input
                value={column.title}
                onChange={(e) =>
                  onUpdate(index, { ...column, title: e.target.value })
                }
                placeholder="Column title"
                className="font-semibold"
              />
              <Textarea
                value={column.description}
                onChange={(e) =>
                  onUpdate(index, { ...column, description: e.target.value })
                }
                placeholder="Column description"
                className="min-h-[60px] text-sm"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onDelete(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Color</Label>
              <Select
                value={column.color}
                onValueChange={(value) =>
                  onUpdate(index, { ...column, color: value })
                }
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
            <div className="space-y-2">
              <Label className="text-xs">Icon</Label>
              <Select
                value={column.icon || ""}
                onValueChange={(value) =>
                  onUpdate(index, { ...column, icon: value })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface CustomTemplateCreatorProps {
  onSave: (template: {
    name: string;
    description: string;
    columns: BoardColumn[];
    is_public: boolean;
  }) => void;
  onCancel: () => void;
  initialColumns?: BoardColumn[];
}

export function CustomTemplateCreator({
  onSave,
  onCancel,
  initialColumns = [],
}: CustomTemplateCreatorProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [columns, setColumns] = useState<BoardColumn[]>(
    initialColumns.length > 0
      ? initialColumns
      : [
          {
            column_type: "column-1",
            title: "",
            description: "",
            color: "bg-green-500/10 border-green-500/20",
            icon: "ThumbsUp",
            display_order: 0,
          },
        ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((i) => i.column_type === active.id);
        const newIndex = items.findIndex((i) => i.column_type === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update display_order
        return newItems.map((item, index) => ({
          ...item,
          display_order: index,
        }));
      });
    }
  };

  const addColumn = () => {
    const newColumn: BoardColumn = {
      column_type: `column-${Date.now()}`,
      title: "",
      description: "",
      color: AVAILABLE_COLORS[columns.length % AVAILABLE_COLORS.length].value,
      icon: AVAILABLE_ICONS[columns.length % AVAILABLE_ICONS.length],
      display_order: columns.length,
    };
    setColumns([...columns, newColumn]);
  };

  const updateColumn = (index: number, updatedColumn: BoardColumn) => {
    const newColumns = [...columns];
    newColumns[index] = updatedColumn;
    setColumns(newColumns);
  };

  const deleteColumn = (index: number) => {
    if (columns.length > 1) {
      const newColumns = columns.filter((_, i) => i !== index);
      // Update display_order
      setColumns(
        newColumns.map((item, index) => ({
          ...item,
          display_order: index,
        }))
      );
    }
  };

  const handleSave = () => {
    onSave({
      name,
      description,
      columns,
      is_public: isPublic,
    });
  };

  const isValid = name.trim() && columns.every((c) => c.title.trim());

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Custom Template</CardTitle>
        <CardDescription>
          Design a reusable retrospective template for your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Team Health Check"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template-description">Description</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe when and how to use this template..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public-template"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label
              htmlFor="public-template"
              className="text-sm font-normal cursor-pointer"
            >
              Make this template public (visible to all teams in the organization)
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Columns ({columns.length})</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addColumn}
              disabled={columns.length >= 6}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={columns.map((c) => c.column_type)}
                strategy={verticalListSortingStrategy}
              >
                {columns.map((column, index) => (
                  <SortableColumnItem
                    key={column.column_type}
                    column={column}
                    index={index}
                    onUpdate={updateColumn}
                    onDelete={deleteColumn}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!isValid}>
          Create Template
        </Button>
      </CardFooter>
    </Card>
  );
}