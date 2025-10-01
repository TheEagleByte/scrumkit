"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreatePokerStory, useUpdatePokerStory } from "@/hooks/use-poker-stories";
import type { PokerStory } from "@/lib/poker/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const storyFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(5000, "Description is too long").optional(),
  acceptance_criteria: z.string().max(5000, "Acceptance criteria is too long").optional(),
  external_link: z
    .string()
    .url("Must be a valid URL")
    .max(500, "Link is too long")
    .optional()
    .or(z.literal("")),
});

type StoryFormValues = z.infer<typeof storyFormSchema>;

interface StoryFormProps {
  sessionId: string;
  story?: PokerStory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StoryForm({
  sessionId,
  story,
  open,
  onOpenChange,
  onSuccess,
}: StoryFormProps) {
  const createStory = useCreatePokerStory();
  const updateStory = useUpdatePokerStory();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storyFormSchema),
    defaultValues: {
      title: story?.title || "",
      description: story?.description || "",
      acceptance_criteria: story?.acceptance_criteria || "",
      external_link: story?.external_link || "",
    },
  });

  async function onSubmit(values: StoryFormValues) {
    setIsSubmitting(true);
    try {
      if (story) {
        // Update existing story
        await updateStory.mutateAsync({
          storyId: story.id,
          sessionId,
          updates: {
            title: values.title,
            description: values.description || undefined,
            acceptance_criteria: values.acceptance_criteria || undefined,
            external_link: values.external_link || undefined,
          },
        });
      } else {
        // Create new story
        await createStory.mutateAsync({
          sessionId,
          title: values.title,
          description: values.description || undefined,
          acceptance_criteria: values.acceptance_criteria || undefined,
          external_link: values.external_link || undefined,
        });
      }

      form.reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving story:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? "Edit Story" : "Add New Story"}</DialogTitle>
          <DialogDescription>
            {story
              ? "Update the details of this story for estimation."
              : "Add a new story or ticket to be estimated by the team."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="User authentication feature"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief, descriptive title for this story
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Implement user authentication with email and password..."
                      {...field}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Detailed description of what needs to be done
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Acceptance Criteria */}
            <FormField
              control={form.control}
              name="acceptance_criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acceptance Criteria</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="- Users can sign up with email and password&#10;- Users can sign in with their credentials&#10;- Password reset functionality works"
                      {...field}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Specific conditions that must be met for this story to be complete
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* External Link */}
            <FormField
              control={form.control}
              name="external_link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>External Link</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://jira.example.com/TICKET-123"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to Jira, GitHub issue, or other external tracker
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {story ? "Update Story" : "Add Story"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
