import { describe, it, expect, beforeEach } from "vitest";
import { formatMarkdownExport, type ExportData } from "../retro-export";

describe("formatMarkdownExport", () => {
  let mockExportData: ExportData;

  beforeEach(() => {
    mockExportData = {
      retrospectiveName: "Sprint 10 Retrospective",
      teamName: "Development Team",
      sprintName: "Sprint 10",
      date: new Date("2024-01-15T12:00:00Z"),
      columns: [
        {
          id: "col-1",
          retrospective_id: "retro-1",
          title: "What went well",
          description: "Things that went well",
          column_type: "went-well",
          display_order: 1,
          color: null,
          created_at: "2024-01-15T12:00:00Z",
        },
        {
          id: "col-2",
          retrospective_id: "retro-1",
          title: "What could be improved",
          description: "Areas for improvement",
          column_type: "improve",
          display_order: 2,
          color: null,
          created_at: "2024-01-15T12:00:00Z",
        },
        {
          id: "col-3",
          retrospective_id: "retro-1",
          title: "Action Items",
          description: "Action items",
          column_type: "action-items",
          display_order: 3,
          color: null,
          created_at: "2024-01-15T12:00:00Z",
        },
      ],
      items: [
        {
          id: "item-1",
          retrospective_id: "retro-1",
          column_id: "col-1",
          text: "Great team collaboration",
          author_id: "user-1",
          author_name: "John Doe",
          created_at: "2024-01-15T12:00:00Z",
          updated_at: null,
          position: 0,
          color: null,
        },
        {
          id: "item-2",
          retrospective_id: "retro-1",
          column_id: "col-2",
          text: "Need better documentation",
          author_id: "user-2",
          author_name: "Jane Smith",
          created_at: "2024-01-15T12:00:00Z",
          updated_at: null,
          position: 0,
          color: null,
        },
        {
          id: "item-3",
          retrospective_id: "retro-1",
          column_id: "col-3",
          text: "Update API documentation",
          author_id: "user-1",
          author_name: "John Doe",
          created_at: "2024-01-15T12:00:00Z",
          updated_at: null,
          position: 0,
          color: null,
        },
      ],
      votes: [
        {
          id: "vote-1",
          profile_id: "user-1",
          item_id: "item-1",
          retrospective_id: "retro-1",
          created_at: "2024-01-15T12:00:00Z",
        },
        {
          id: "vote-2",
          profile_id: "user-2",
          item_id: "item-1",
          retrospective_id: "retro-1",
          created_at: "2024-01-15T12:00:00Z",
        },
        {
          id: "vote-3",
          profile_id: "user-3",
          item_id: "item-2",
          retrospective_id: "retro-1",
          created_at: "2024-01-15T12:00:00Z",
        },
      ],
    };
  });

  it("should format markdown with grouped items by default", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("# Sprint 10 Retrospective");
    expect(result).toContain("**Team:** Development Team");
    expect(result).toContain("**Sprint:** Sprint 10");
    expect(result).toContain("## What went well");
    expect(result).toContain("## What could be improved");
    expect(result).toContain("Great team collaboration");
    expect(result).toContain("Need better documentation");
  });

  it("should include vote counts when enabled", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("(2 👍)");
    expect(result).toContain("(1 👍)");
  });

  it("should exclude vote counts when disabled", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: false,
      includeMetadata: true,
    });

    expect(result).not.toContain("👍");
  });

  it("should format as ungrouped when grouped is false", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: false,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("## All Items");
    expect(result).toContain("**[What went well]**");
    expect(result).toContain("**[What could be improved]**");
  });

  it("should include author names", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("*John Doe*");
    expect(result).toContain("*Jane Smith*");
  });

  it("should exclude metadata when disabled", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: false,
    });

    expect(result).not.toContain("# Sprint 10 Retrospective");
    expect(result).not.toContain("**Team:** Development Team");
    expect(result).toContain("## What went well");
  });

  it("should handle action items in ungrouped mode", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: false,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("## Action Items");
    expect(result).toContain("- [ ] Update API documentation");
  });

  it("should handle empty columns", () => {
    const emptyData = {
      ...mockExportData,
      items: [],
    };

    const result = formatMarkdownExport(emptyData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("*No items*");
  });

  it("should sort items by vote count", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    const item1Index = result.indexOf("Great team collaboration");
    const item2Index = result.indexOf("Need better documentation");

    expect(item1Index).toBeLessThan(item2Index);
  });

  it("should include generation timestamp", () => {
    const result = formatMarkdownExport(mockExportData, {
      grouped: true,
      includeVotes: true,
      includeMetadata: true,
    });

    expect(result).toContain("*Generated on");
  });
});