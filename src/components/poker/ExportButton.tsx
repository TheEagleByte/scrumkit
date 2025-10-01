"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSessionStatistics } from "@/hooks/use-poker-statistics";
import { exportSessionToCSV, prepareExportData, downloadCSV } from "@/lib/poker/csv-export";
import type { PokerSession } from "@/lib/poker/types";

interface ExportButtonProps {
  session: PokerSession;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function ExportButton({ session, variant = "outline", size = "default" }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { data: statistics } = useSessionStatistics(session.id);

  const handleExport = async () => {
    if (!statistics) {
      toast.error("No statistics available to export");
      return;
    }

    if (statistics.estimatedStories === 0) {
      toast.error("No estimated stories to export");
      return;
    }

    setIsExporting(true);

    try {
      // Prepare export data
      const exportData = prepareExportData(
        {
          title: session.title,
          description: session.description,
          created_at: session.created_at,
          estimation_sequence: session.estimation_sequence,
        },
        statistics
      );

      // Generate CSV content
      const csvContent = exportSessionToCSV(exportData);

      // Trigger download
      const filename = `poker-session-${session.unique_url}-${new Date().toISOString().split("T")[0]}`;
      downloadCSV(csvContent, filename);

      toast.success("Session exported successfully!");
    } catch (error) {
      console.error("Error exporting session:", error);
      toast.error("Failed to export session");
    } finally {
      setIsExporting(false);
    }
  };

  const hasEstimatedStories = (statistics?.estimatedStories ?? 0) > 0;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting || !hasEstimatedStories}
      title={
        !hasEstimatedStories
          ? "No estimated stories to export"
          : "Export session statistics to CSV"
      }
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </>
      )}
    </Button>
  );
}
