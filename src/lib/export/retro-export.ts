import type { Database } from "@/lib/supabase/types-enhanced";

type RetrospectiveItem = Database["public"]["Tables"]["retrospective_items"]["Row"];
type RetrospectiveColumn = Database["public"]["Tables"]["retrospective_columns"]["Row"];
type Vote = Database["public"]["Tables"]["votes"]["Row"];

export interface ExportData {
  retrospectiveName: string;
  teamName: string;
  sprintName?: string;
  date: Date;
  columns: RetrospectiveColumn[];
  items: RetrospectiveItem[];
  votes: Vote[];
}

export interface ExportOptions {
  grouped: boolean;
  includeVotes: boolean;
  includeMetadata: boolean;
}

export function formatMarkdownExport(
  data: ExportData,
  options: ExportOptions = {
    grouped: true,
    includeVotes: true,
    includeMetadata: true,
  }
): string {
  const lines: string[] = [];

  if (options.includeMetadata) {
    lines.push(`# ${data.retrospectiveName || "Sprint Retrospective"}`);
    lines.push("");
    lines.push(`**Team:** ${data.teamName}`);
    if (data.sprintName) {
      lines.push(`**Sprint:** ${data.sprintName}`);
    }
    lines.push(`**Date:** ${data.date.toLocaleDateString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  const voteCountMap = new Map<string, number>();
  for (const vote of data.votes) {
    voteCountMap.set(vote.item_id, (voteCountMap.get(vote.item_id) || 0) + 1);
  }

  if (options.grouped) {
    const sortedColumns = [...data.columns].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );

    for (const column of sortedColumns) {
      lines.push(`## ${column.title}`);
      if (column.description) {
        lines.push("");
        lines.push(`*${column.description}*`);
      }
      lines.push("");

      const columnItems = data.items
        .filter((item) => item.column_id === column.id)
        .sort((a, b) => {
          const aVotes = voteCountMap.get(a.id) || 0;
          const bVotes = voteCountMap.get(b.id) || 0;
          if (aVotes !== bVotes) return bVotes - aVotes;
          return (
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime()
          );
        });

      if (columnItems.length === 0) {
        lines.push("*No items*");
        lines.push("");
      } else {
        for (const item of columnItems) {
          const votes = voteCountMap.get(item.id) || 0;
          const voteText = options.includeVotes && votes > 0 ? ` (${votes} 👍)` : "";
          const authorText = item.author_name ? ` - *${item.author_name}*` : "";
          lines.push(`- ${item.text}${voteText}${authorText}`);
        }
        lines.push("");
      }
    }
  } else {
    lines.push(`## All Items`);
    lines.push("");

    const allItems = [...data.items].sort((a, b) => {
      const aVotes = voteCountMap.get(a.id) || 0;
      const bVotes = voteCountMap.get(b.id) || 0;
      if (aVotes !== bVotes) return bVotes - aVotes;
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    });

    for (const item of allItems) {
      const column = data.columns.find((c) => c.id === item.column_id);
      const votes = voteCountMap.get(item.id) || 0;
      const voteText = options.includeVotes && votes > 0 ? ` (${votes} 👍)` : "";
      const authorText = item.author_name ? ` - *${item.author_name}*` : "";
      const columnText = column ? ` **[${column.title}]**` : "";
      lines.push(`- ${item.text}${voteText}${authorText}${columnText}`);
    }
    lines.push("");
  }

  const actionItemsColumn = data.columns.find(
    (c) => c.column_type === "action-items"
  );
  if (actionItemsColumn) {
    const actionItems = data.items.filter(
      (item) => item.column_id === actionItemsColumn.id
    );

    if (actionItems.length > 0 && !options.grouped) {
      lines.push("---");
      lines.push("");
      lines.push("## Action Items");
      lines.push("");

      for (const item of actionItems) {
        const votes = voteCountMap.get(item.id) || 0;
        const voteText = options.includeVotes && votes > 0 ? ` (${votes} 👍)` : "";
        const authorText = item.author_name ? ` - *${item.author_name}*` : "";
        lines.push(`- [ ] ${item.text}${voteText}${authorText}`);
      }
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("");
  lines.push(`*Generated on ${new Date().toLocaleString()}*`);

  return lines.join("\n");
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}