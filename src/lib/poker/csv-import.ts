// CSV Import utility for Planning Poker stories

export interface CSVStory {
  title: string;
  description?: string;
  acceptance_criteria?: string;
  external_link?: string;
}

export interface CSVImportResult {
  stories: CSVStory[];
  errors: string[];
}

/**
 * Parse CSV text and return validated story objects
 * Expected CSV format:
 * title,description,acceptance_criteria,external_link
 * "Story Title","Story description","Acceptance criteria","https://link.com"
 */
export function parseCSVStories(csvText: string): CSVImportResult {
  const errors: string[] = [];
  const stories: CSVStory[] = [];

  // Split by newlines but handle quoted fields with newlines
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    errors.push("CSV file is empty");
    return { stories, errors };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map(h => h.toLowerCase().trim());

  // Validate required columns
  if (!headers.includes("title")) {
    errors.push("CSV must have a 'title' column");
    return { stories, errors };
  }

  // Get column indices
  const titleIdx = headers.indexOf("title");
  const descIdx = headers.indexOf("description");
  const acIdx = headers.indexOf("acceptance_criteria");
  const linkIdx = headers.indexOf("external_link");

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i];

    try {
      const fields = parseCSVLine(line);

      // Validate title exists
      const title = fields[titleIdx]?.trim();
      if (!title) {
        errors.push(`Line ${lineNum}: Missing title`);
        continue;
      }

      // Validate title length
      if (title.length > 255) {
        errors.push(`Line ${lineNum}: Title too long (max 255 characters)`);
        continue;
      }

      const story: CSVStory = {
        title,
        description: descIdx >= 0 ? fields[descIdx]?.trim() : undefined,
        acceptance_criteria: acIdx >= 0 ? fields[acIdx]?.trim() : undefined,
        external_link: linkIdx >= 0 ? fields[linkIdx]?.trim() : undefined,
      };

      // Validate external link format if provided
      if (story.external_link) {
        try {
          new URL(story.external_link);
        } catch {
          errors.push(`Line ${lineNum}: Invalid URL format for external_link`);
          continue;
        }

        // Limit URL length
        if (story.external_link.length > 500) {
          errors.push(`Line ${lineNum}: External link too long (max 500 characters)`);
          continue;
        }
      }

      stories.push(story);
    } catch (error) {
      errors.push(`Line ${lineNum}: Failed to parse - ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  return { stories, errors };
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentField += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Field separator
      fields.push(currentField);
      currentField = "";
    } else {
      currentField += char;
    }
  }

  // Add last field
  fields.push(currentField);

  return fields;
}

/**
 * Generate a CSV template for download
 */
export function generateCSVTemplate(): string {
  return `title,description,acceptance_criteria,external_link
"User Login","Implement user authentication","Users can login with email and password","https://jira.example.com/TICKET-123"
"Dashboard View","Create dashboard with metrics","Dashboard shows key performance indicators",""
"Export Reports","Add export functionality","Users can export data as CSV or PDF","https://github.com/example/repo/issues/456"`;
}

/**
 * Validate a story object
 */
export function validateStory(story: Partial<CSVStory>): string[] {
  const errors: string[] = [];

  if (!story.title || story.title.trim().length === 0) {
    errors.push("Title is required");
  }

  if (story.title && story.title.length > 255) {
    errors.push("Title is too long (max 255 characters)");
  }

  if (story.external_link) {
    try {
      new URL(story.external_link);
    } catch {
      errors.push("External link must be a valid URL");
    }

    if (story.external_link.length > 500) {
      errors.push("External link is too long (max 500 characters)");
    }
  }

  return errors;
}
