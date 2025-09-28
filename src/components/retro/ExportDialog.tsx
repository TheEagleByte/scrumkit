"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  formatMarkdownExport,
  downloadMarkdown,
  copyToClipboard,
  type ExportData,
  type ExportOptions,
} from "@/lib/export/retro-export";

const DEFAULT_FILENAME = "retrospective";

// Replace any character not allowed in filenames with '_'
// This covers Windows and Unix invalid filename characters plus control chars
function sanitizeFilename(rawName?: string): string {
  const candidate = rawName ?? DEFAULT_FILENAME;
  const sanitized = candidate
    .replace(/[\x00-\x1f\x7f]/g, "") // Remove control characters
    .replace(/[\/\\:*?"<>|]/g, "_") // Replace filesystem-invalid chars
    .trim();

  return sanitized.length > 0 ? sanitized : DEFAULT_FILENAME;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportData: ExportData;
}

export function ExportDialog({
  open,
  onOpenChange,
  exportData,
}: ExportDialogProps) {
  const [options, setOptions] = useState<ExportOptions>({
    grouped: true,
    includeVotes: true,
    includeMetadata: true,
  });

  const markdownContent = formatMarkdownExport(exportData, options);

  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard(markdownContent);
      toast.success("Copied to clipboard!", {
        description: "Retrospective exported as Markdown",
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    try {
      const safeSprintName = sanitizeFilename(exportData.sprintName);
      const filename = `${safeSprintName}-${
        exportData.date.toISOString().split("T")[0]
      }.md`;
      downloadMarkdown(markdownContent, filename);
      toast.success("Downloaded successfully!", {
        description: filename,
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to download file:", error);
      toast.error("Failed to download file");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Retrospective
          </DialogTitle>
          <DialogDescription>
            Export your retrospective in Markdown format to share with
            stakeholders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="grouped-export" className="flex flex-col gap-1">
                <span>Grouped by Columns</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Organize items by their respective columns
                </span>
              </Label>
              <Switch
                id="grouped-export"
                checked={options.grouped}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, grouped: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-votes" className="flex flex-col gap-1">
                <span>Include Vote Counts</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Show the number of votes each item received
                </span>
              </Label>
              <Switch
                id="include-votes"
                checked={options.includeVotes}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeVotes: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="include-metadata" className="flex flex-col gap-1">
                <span>Include Metadata</span>
                <span className="text-xs text-muted-foreground font-normal">
                  Add header with team name, sprint, and date
                </span>
              </Label>
              <Switch
                id="include-metadata"
                checked={options.includeMetadata}
                onCheckedChange={(checked) =>
                  setOptions({ ...options, includeMetadata: checked })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <Textarea
              value={markdownContent}
              readOnly
              className="font-mono text-sm min-h-[300px] resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy to Clipboard
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Markdown
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}