"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, X } from "lucide-react";
import { playFocusToggle } from "@/lib/utils/sound-notifications";

interface FocusModeProps {
  columns: Array<{ id: string; title: string; color?: string }>;
  focusedColumnId: string | null;
  onChange?: (columnId: string | null) => void;
  compact?: boolean; // Compact mode for header display
}

export function FocusMode({ columns, focusedColumnId, onChange, compact = false }: FocusModeProps) {
  const focusedColumn = columns.find((col) => col.id === focusedColumnId);

  const handleFocusChange = (columnId: string | null) => {
    if (columnId !== focusedColumnId) {
      playFocusToggle();
      onChange?.(columnId);
    }
  };

  const handleClearFocus = () => {
    if (focusedColumnId) {
      playFocusToggle();
      onChange?.(null);
    }
  };

  if (compact) {
    if (!focusedColumnId || !focusedColumn) {
      return null;
    }

    return (
      <Badge variant="outline" className="gap-2 px-3 py-1.5">
        <Target className="h-3 w-3" />
        <span>Focus: {focusedColumn.title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClearFocus();
          }}
          className="ml-1 hover:bg-muted rounded-sm p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      </Badge>
    );
  }

  return (
    <div className="space-y-4">
      {/* Focus Mode Description */}
      <div className="p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-start gap-3">
          <Target className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div className="flex-1">
            <div className="font-medium mb-1">Focus Mode</div>
            <div className="text-sm text-muted-foreground">
              Highlight a single column to help the team concentrate on one topic at a time.
              Other columns will be dimmed.
            </div>
          </div>
        </div>
      </div>

      {/* Current Focus */}
      {focusedColumnId && focusedColumn && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Currently Focused:</span>
              <span>{focusedColumn.title}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFocus}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Column Selection */}
      <div className="space-y-2">
        <div className="text-sm font-medium">Select Column to Focus</div>
        <div className="grid grid-cols-1 gap-2">
          {columns.map((column) => {
            const isFocused = column.id === focusedColumnId;
            return (
              <Button
                key={column.id}
                variant={isFocused ? "default" : "outline"}
                className={`justify-start ${!isFocused && column.color ? column.color : ''}`}
                onClick={() => handleFocusChange(isFocused ? null : column.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{column.title}</span>
                  {isFocused && <Badge variant="secondary" className="ml-2">Active</Badge>}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Clear All Button */}
      {focusedColumnId && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleClearFocus}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Focus Mode
        </Button>
      )}
    </div>
  );
}
