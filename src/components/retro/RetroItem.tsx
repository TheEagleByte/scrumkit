"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Edit2, Check, XCircle, Palette } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface RetroItemData {
  id: string;
  text: string;
  author: string;
  votes: number;
  timestamp: Date;
  color?: string | null;
}

interface RetroItemProps {
  item: RetroItemData;
  onRemove: (itemId: string) => void;
  onVote: (itemId: string) => void;
  onEdit?: (itemId: string, newText: string) => void;
  onColorChange?: (itemId: string, color: string) => void;
  isAuthor?: boolean;
}

const PRESET_COLORS = [
  '#ffffff', // white
  '#fef3c7', // yellow
  '#dbeafe', // blue
  '#d1fae5', // green
  '#fce7f3', // pink
  '#e0e7ff', // indigo
  '#fed7aa', // orange
  '#f3e8ff', // purple
];

export const RetroItem = memo(function RetroItem({
  item,
  onRemove,
  onVote,
  onEdit,
  onColorChange,
  isAuthor = false
}: RetroItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (isAuthor && onEdit) {
      setEditText(item.text);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== item.text && onEdit) {
      onEdit(item.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(item.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleColorChange = (color: string) => {
    if (onColorChange) {
      onColorChange(item.id, color);
    }
  };

  const cardBgColor = item.color || '#ffffff';
  return (
    <Card
      className="bg-card/50 border-border/50 border transition-all"
      style={{ backgroundColor: cardBgColor }}
      onDoubleClick={handleStartEdit}
    >
      <CardContent className="p-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] text-sm"
              placeholder="Edit your item..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editText.trim()}
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelEdit}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="flex-1 text-sm text-pretty">
                {item.text}
              </p>
              <div className="flex gap-1">
                {isAuthor && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleStartEdit}
                    aria-label="Edit item"
                    title="Edit (or double-click)"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                )}
                {isAuthor && onColorChange && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        aria-label="Change color"
                      >
                        <Palette className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <div className="grid grid-cols-4 gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            className="h-8 w-8 rounded border-2 hover:scale-110 transition-transform"
                            style={{
                              backgroundColor: color,
                              borderColor: color === cardBgColor ? '#000' : '#ccc'
                            }}
                            onClick={() => handleColorChange(color)}
                            aria-label={`Set color ${color}`}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => onRemove(item.id)}
                    aria-label="Remove item"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {item.author}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onVote(item.id)}
              >
                👍 {item.votes}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});