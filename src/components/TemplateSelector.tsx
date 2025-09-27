"use client";

import type React from "react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Layout, Star, Users, Globe } from "lucide-react";
import { boardTemplates, type BoardTemplate } from "@/lib/boards/templates";
import type { Tables } from "@/lib/supabase/types";

interface TemplateSelectorProps {
  selectedTemplateId: string;
  onTemplateSelect: (templateId: string) => void;
  customTemplates?: Tables<"custom_templates">[];
  showCustomTemplateButton?: boolean;
  onCreateCustomTemplate?: (template: Omit<Tables<"custom_templates">, "id" | "created_at" | "updated_at">) => void;
  userPreferences?: {
    preferred_template_id?: string | null;
    recent_templates?: string[];
  };
}

export function TemplateSelector({
  selectedTemplateId,
  onTemplateSelect,
  customTemplates = [],
  showCustomTemplateButton = true,
  onCreateCustomTemplate,
  userPreferences,
}: TemplateSelectorProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const allTemplates = [
    ...boardTemplates,
    ...customTemplates.map((ct) => ({
      id: ct.id,
      name: ct.name,
      description: ct.description || "",
      columns: (ct.columns as unknown) as BoardTemplate["columns"],
      isCustom: true,
      isPublic: ct.is_public,
      createdBy: ct.created_by,
    })),
  ];

  const preferredTemplate = userPreferences?.preferred_template_id;
  const recentTemplates = userPreferences?.recent_templates || [];

  // Sort templates: preferred first, then recent, then alphabetical
  const sortedTemplates = allTemplates.sort((a, b) => {
    if (a.id === preferredTemplate) return -1;
    if (b.id === preferredTemplate) return 1;

    const aRecentIndex = recentTemplates.indexOf(a.id);
    const bRecentIndex = recentTemplates.indexOf(b.id);

    if (aRecentIndex !== -1 && bRecentIndex === -1) return -1;
    if (bRecentIndex !== -1 && aRecentIndex === -1) return 1;
    if (aRecentIndex !== -1 && bRecentIndex !== -1) {
      return aRecentIndex - bRecentIndex;
    }

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Choose a Template</h3>
          <p className="text-sm text-muted-foreground">
            Select a retrospective format that works best for your team
          </p>
        </div>
        {showCustomTemplateButton && onCreateCustomTemplate && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Custom Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Custom Template</DialogTitle>
                <DialogDescription>
                  Custom templates can be created from an existing retrospective board.
                  Start a retrospective session, configure your columns, and then save it as a template for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-sm text-muted-foreground">
                <p className="mb-2">To create a custom template:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Start a new retrospective or open an existing one</li>
                  <li>Configure the columns as needed</li>
                  <li>Use the &quot;Save as Template&quot; option in the board menu</li>
                </ol>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Got it
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <RadioGroup
          value={selectedTemplateId}
          onValueChange={onTemplateSelect}
          className="space-y-3"
        >
          {sortedTemplates.map((template) => {
            const isPreferred = template.id === preferredTemplate;
            const isRecent = recentTemplates.includes(template.id);
            const templateWithCustom = template as BoardTemplate & { isCustom?: boolean; isPublic?: boolean };
            const isCustom = "isCustom" in templateWithCustom && templateWithCustom.isCustom;
            const isPublic = "isPublic" in templateWithCustom && templateWithCustom.isPublic;

            return (
              <div key={template.id} className="relative">
                <RadioGroupItem
                  value={template.id}
                  id={template.id}
                  className="peer sr-only"
                />
                <Label
                  htmlFor={template.id}
                  className="flex cursor-pointer rounded-lg border border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Layout className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">{template.name}</p>
                      </div>
                      <div className="flex gap-1">
                        {isPreferred && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="mr-1 h-3 w-3" />
                            Preferred
                          </Badge>
                        )}
                        {isRecent && !isPreferred && (
                          <Badge variant="outline" className="text-xs">
                            Recent
                          </Badge>
                        )}
                        {isCustom && (
                          <Badge variant="outline" className="text-xs">
                            {isPublic ? (
                              <>
                                <Globe className="mr-1 h-3 w-3" />
                                Public
                              </>
                            ) : (
                              <>
                                <Users className="mr-1 h-3 w-3" />
                                Team
                              </>
                            )}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {template.columns.map((column, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {column.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
}