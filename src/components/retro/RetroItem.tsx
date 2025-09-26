"use client";

import React, { memo, useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Edit2, Check, XCircle } from "lucide-react";
import { VoteIndicator } from "./VoteIndicator";
import type { Database } from "@/lib/supabase/types-enhanced";

type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];

export interface RetroItemData extends Pick<RetrospectiveItem, "id" | "text" | "color"> {
  author: string;
  votes: number;
  timestamp: Date;
  hasVoted?: boolean;
  canVote?: boolean;
  voters?: string[];
}

interface RetroItemProps {
  item: RetroItemData;
  onRemove: (itemId: string) => void;
  onVote: (itemId: string) => void;
  onEdit?: (itemId: string, newText: string) => void;
  isAuthor?: boolean;
}

export const RetroItem = memo(function RetroItem({
  item,
  onRemove,
  onVote,
  onEdit,
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

  return (
    <Card
      className="border-border/50 border transition-all bg-card/50"
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
              <VoteIndicator
                voteCount={item.votes}
                hasVoted={item.hasVoted || false}
                canVote={item.canVote !== false}
                onVote={() => onVote(item.id)}
                voters={item.voters}
                showTooltip={true}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
});