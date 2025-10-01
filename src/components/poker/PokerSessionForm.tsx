"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useCreatePokerSession } from "@/hooks/use-poker-session";
import { getAvailableSequences } from "@/lib/poker/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  estimationSequence: z.enum(["fibonacci", "tshirt", "linear", "powers-of-2"]),
  autoReveal: z.boolean(),
  allowRevote: z.boolean(),
  showVoterNames: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export function PokerSessionForm() {
  const router = useRouter();
  const createSession = useCreatePokerSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sequences = getAvailableSequences();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      estimationSequence: "fibonacci",
      autoReveal: false,
      allowRevote: true,
      showVoterNames: true,
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const result = await createSession.mutateAsync({
        title: values.title,
        description: values.description,
        settings: {
          estimationSequence: values.estimationSequence,
          autoReveal: values.autoReveal,
          allowRevote: values.allowRevote,
          showVoterNames: values.showVoterNames,
        },
      });

      // Navigate to the new session
      router.push(`/poker/${result.unique_url}`);
    } catch (error) {
      console.error("Error creating session:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Planning Poker Session</CardTitle>
        <CardDescription>
          Set up a new planning poker session for your team to estimate stories together.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sprint 24 Planning"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    Give your session a descriptive name
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Estimate stories for the upcoming sprint..."
                      {...field}
                      disabled={isSubmitting}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Add context about what you&apos;ll be estimating
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimation Sequence */}
            <FormField
              control={form.control}
              name="estimationSequence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimation Sequence</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a sequence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sequences.map((seq) => (
                        <SelectItem key={seq.type} value={seq.type}>
                          <div className="flex flex-col">
                            <span className="font-medium">{seq.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {seq.values.join(", ")}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the scale your team will use for estimates
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Session Settings</h3>

              <FormField
                control={form.control}
                name="autoReveal"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-reveal votes</FormLabel>
                      <FormDescription>
                        Automatically reveal votes when all participants have voted
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowRevote"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Allow revoting</FormLabel>
                      <FormDescription>
                        Let participants change their vote before reveal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showVoterNames"
                render={({ field}) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show voter names</FormLabel>
                      <FormDescription>
                        Display who voted (not their vote) during voting
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Session
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
