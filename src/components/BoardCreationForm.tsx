"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBoard } from "@/lib/boards/actions";
import { boardTemplates } from "@/lib/boards/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, ArrowRight, Lightbulb, ThumbsUp, Heart, TrendingUp, Plus, Smile } from "lucide-react";
import { toast } from "sonner";

const templateIcons: Record<string, React.ReactNode> = {
  default: <ThumbsUp className="h-5 w-5" />,
  "mad-sad-glad": <Smile className="h-5 w-5" />,
  "start-stop-continue": <TrendingUp className="h-5 w-5" />,
  "4ls": <Heart className="h-5 w-5" />,
  sailboat: <TrendingUp className="h-5 w-5" />,
  "plus-delta": <Plus className="h-5 w-5" />,
};

export function BoardCreationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!boardTitle.trim()) {
      toast.error("Please enter a board title");
      return;
    }

    setIsLoading(true);

    try {
      const board = await createBoard({
        title: boardTitle,
        templateId: selectedTemplate,
      });

      toast.success("Board created successfully!");
      router.push(`/retro/${board.unique_url}`);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Failed to create board. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Board Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Board Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Sprint 24 Retrospective"
          value={boardTitle}
          onChange={(e) => setBoardTitle(e.target.value)}
          disabled={isLoading}
          className="text-lg"
          autoFocus
        />
        <p className="text-sm text-muted-foreground">
          Give your retrospective board a memorable name
        </p>
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <Label>Choose a Template</Label>
        <RadioGroup
          value={selectedTemplate}
          onValueChange={setSelectedTemplate}
          disabled={isLoading}
          className="grid gap-3"
        >
          {boardTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id
                  ? "border-primary ring-2 ring-primary ring-opacity-20"
                  : "hover:border-gray-400"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {templateIcons[template.id] || <Lightbulb className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-base font-medium">
                        {template.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <RadioGroupItem
                    value={template.id}
                    className="mt-1"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2">
                  {template.columns.map((column) => (
                    <span
                      key={column.column_type}
                      className="px-2 py-1 text-xs rounded-md bg-muted"
                    >
                      {column.title}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isLoading || !boardTitle.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Board...
          </>
        ) : (
          <>
            Create Board
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Info Text */}
      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          <strong>No sign-up required!</strong> Your board will be created instantly
          with a unique, shareable link. You can start collaborating with your team
          right away.
        </p>
      </div>
    </form>
  );
}