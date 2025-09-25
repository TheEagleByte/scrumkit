"use client";

import React, { memo, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

interface AddItemFormProps {
  isActive: boolean;
  onActivate: () => void;
  onCancel: () => void;
  onAdd: (text: string, author: string) => void;
}

export const AddItemForm = memo(function AddItemForm({
  isActive,
  onActivate,
  onCancel,
  onAdd
}: AddItemFormProps) {
  const [itemText, setItemText] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = useCallback(() => {
    if (itemText.trim() && author.trim()) {
      onAdd(itemText, author);
      setItemText("");
      setAuthor("");
    }
  }, [itemText, author, onAdd]);

  const handleCancel = useCallback(() => {
    setItemText("");
    setAuthor("");
    onCancel();
  }, [onCancel]);

  if (!isActive) {
    return (
      <Button
        variant="ghost"
        className="border-border/50 h-12 w-full border-2 border-dashed"
        onClick={onActivate}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add item
      </Button>
    );
  }

  return (
    <Card className="bg-card/30 border-2 border-dashed">
      <CardContent className="space-y-3 p-4">
        <Textarea
          placeholder="What would you like to share?"
          value={itemText}
          onChange={(e) => setItemText(e.target.value)}
          className="min-h-[80px] resize-none"
          autoFocus
        />
        <Input
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!itemText.trim() || !author.trim()}
          >
            Add Item
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});