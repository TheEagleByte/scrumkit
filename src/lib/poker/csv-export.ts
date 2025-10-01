// CSV Export utility for Planning Poker session statistics

import type { ExportData, SessionStatistics } from "./types";

/**
 * Export session statistics to CSV format
 * @param exportData - The formatted export data
 * @returns CSV string ready for download
 */
export function exportSessionToCSV(exportData: ExportData): string {
  const lines: string[] = [];

  // Header section
  lines.push("Planning Poker Session Export");
  lines.push(`Session: ${escapeCsvField(exportData.session.title)}`);
  lines.push(`Description: ${escapeCsvField(exportData.session.description || "")}`);
  lines.push(`Created: ${exportData.session.createdAt}`);
  lines.push(`Estimation Sequence: ${exportData.session.estimationSequence}`);
  lines.push("");

  // Summary section
  lines.push("Summary Statistics");
  lines.push(`Total Stories: ${exportData.summary.totalStories}`);
  lines.push(
    `Average Estimation Time: ${exportData.summary.averageTime !== null ? exportData.summary.averageTime.toFixed(1) + " minutes" : "N/A"}`
  );
  lines.push(`Overall Consensus Rate: ${exportData.summary.consensusRate.toFixed(1)}%`);
  lines.push("");

  // Stories detail section
  lines.push("Story Details");
  lines.push(
    [
      "Title",
      "Description",
      "Final Estimate",
      "Vote Count",
      "Average Vote",
      "Median Vote",
      "Consensus %",
      "Time (min)",
      "Participants",
      "Votes",
    ].join(",")
  );

  exportData.stories.forEach((story) => {
    const row = [
      escapeCsvField(story.title),
      escapeCsvField(story.finalEstimate || ""),
      story.voteCount.toString(),
      story.averageVote !== null ? story.averageVote.toFixed(1) : "N/A",
      story.medianVote !== null ? story.medianVote.toString() : "N/A",
      story.consensusPercentage.toFixed(1) + "%",
      story.estimationTimeMinutes !== null
        ? story.estimationTimeMinutes.toFixed(1)
        : "N/A",
      escapeCsvField(story.participants.join("; ")),
      escapeCsvField(story.votes.map((v) => `${v.participantName}:${v.voteValue}`).join("; ")),
    ];
    lines.push(row.join(","));
  });

  return lines.join("\n");
}

/**
 * Prepare session statistics for export
 * @param session - Session metadata
 * @param statistics - Computed session statistics
 * @returns Formatted export data
 */
export function prepareExportData(
  session: {
    title: string;
    description: string | null;
    created_at: string;
    estimation_sequence: string;
  },
  statistics: SessionStatistics
): ExportData {
  return {
    session: {
      title: session.title,
      description: session.description,
      createdAt: new Date(session.created_at).toLocaleString(),
      estimationSequence: session.estimation_sequence,
    },
    stories: statistics.storyStats,
    summary: {
      totalStories: statistics.estimatedStories,
      averageTime: statistics.averageEstimationTimeMinutes,
      consensusRate: statistics.overallConsensusRate,
    },
  };
}

/**
 * Escape a field for CSV format
 * Handles quotes, commas, and newlines
 */
function escapeCsvField(field: string): string {
  if (field === null || field === undefined) {
    return "";
  }

  const stringField = String(field);

  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringField.includes(",") || stringField.includes('"') || stringField.includes("\n")) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }

  return stringField;
}

/**
 * Trigger a browser download of CSV content
 * @param csvContent - The CSV string
 * @param filename - Desired filename (without extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
