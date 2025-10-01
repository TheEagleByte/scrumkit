import { describe, it, expect } from '@jest/globals';
import {
  parseCSVStories,
  generateCSVTemplate,
  validateStory,
  type CSVStory,
} from '../csv-import';

describe('parseCSVStories', () => {
  it('should parse valid CSV with all fields', () => {
    const csv = `title,description,acceptance_criteria,external_link
"User Login","Implement authentication","Users can login","https://example.com"
"Dashboard","Create dashboard","Display metrics","https://example.com/2"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(2);
    expect(result.stories[0]).toEqual({
      title: 'User Login',
      description: 'Implement authentication',
      acceptance_criteria: 'Users can login',
      external_link: 'https://example.com',
    });
  });

  it('should handle CSV with only required title field', () => {
    const csv = `title
"Simple Story"
"Another Story"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(2);
    expect(result.stories[0]).toEqual({
      title: 'Simple Story',
      description: undefined,
      acceptance_criteria: undefined,
      external_link: undefined,
    });
  });

  it('should handle escaped quotes in CSV', () => {
    const csv = `title,description
"Story with ""quotes""","Description with ""quotes"""`;

    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story with "quotes"');
    expect(result.stories[0].description).toBe('Description with "quotes"');
  });

  it('should report error for empty CSV', () => {
    const csv = '';
    const result = parseCSVStories(csv);

    expect(result.errors).toContain('CSV file is empty');
    expect(result.stories).toHaveLength(0);
  });

  it('should report error for missing title column', () => {
    const csv = `description,acceptance_criteria
"Some description","Some criteria"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain("CSV must have a 'title' column");
    expect(result.stories).toHaveLength(0);
  });

  it('should report error for rows with empty title', () => {
    const csv = `title,description
"","Some description"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 2: Missing title');
    expect(result.stories).toHaveLength(0);
  });

  it('should report error for title exceeding 255 characters', () => {
    const longTitle = 'a'.repeat(256);
    const csv = `title
"${longTitle}"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 2: Title too long (max 255 characters)');
    expect(result.stories).toHaveLength(0);
  });

  it('should report error for invalid URL', () => {
    const csv = `title,external_link
"Story","not-a-valid-url"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 2: Invalid URL format for external_link');
    expect(result.stories).toHaveLength(0);
  });

  it('should report error for URL exceeding 500 characters', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500);
    const csv = `title,external_link
"Story","${longUrl}"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 2: External link too long (max 500 characters)');
    expect(result.stories).toHaveLength(0);
  });

  it('should skip invalid rows but parse valid ones', () => {
    const csv = `title,description
"Valid Story","Valid description"
"","Missing title"
"Another Valid","Another description"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 3: Missing title');
    expect(result.stories).toHaveLength(2);
    expect(result.stories[0].title).toBe('Valid Story');
    expect(result.stories[1].title).toBe('Another Valid');
  });

  it('should handle commas in quoted fields', () => {
    const csv = `title,description
"Story with, comma","Description with, comma"`;

    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story with, comma');
    expect(result.stories[0].description).toBe('Description with, comma');
  });

  it('should handle fields with commas', () => {
    const csv = `title,description
"Story with comma","Description, with, commas"`;

    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].description).toBe('Description, with, commas');
  });

  it('should treat empty strings as empty fields', () => {
    const csv = `title,description,acceptance_criteria,external_link
"Story","","",""`;

    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story');
    // Empty strings are kept as empty strings, not undefined
    expect(result.stories[0].description).toBe('');
  });
});

describe('generateCSVTemplate', () => {
  it('should generate valid CSV template', () => {
    const template = generateCSVTemplate();

    expect(template).toContain('title,description,acceptance_criteria,external_link');
    expect(template).toContain('User Login');
    expect(template).toContain('Dashboard View');
    expect(template).toContain('Export Reports');
  });

  it('should have valid URLs in template', () => {
    const template = generateCSVTemplate();

    expect(template).toContain('https://jira.example.com');
    expect(template).toContain('https://github.com');
  });

  it('should be parseable by parseCSVStories', () => {
    const template = generateCSVTemplate();
    const result = parseCSVStories(template);

    expect(result.errors).toEqual([]);
    expect(result.stories.length).toBeGreaterThan(0);
  });

  it('should contain acceptance criteria column', () => {
    const template = generateCSVTemplate();

    expect(template).toContain('acceptance_criteria');
  });

  it('should contain multiple example rows', () => {
    const template = generateCSVTemplate();
    const lines = template.split('\n');

    // Should have header + at least 3 example rows
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });
});

describe('validateStory', () => {
  it('should return no errors for valid story', () => {
    const story: CSVStory = {
      title: 'Valid Story',
      description: 'Valid description',
      acceptance_criteria: 'Valid criteria',
      external_link: 'https://example.com',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should report error for missing title', () => {
    const story: Partial<CSVStory> = {
      description: 'Some description',
    };

    const errors = validateStory(story);

    expect(errors).toContain('Title is required');
  });

  it('should report error for empty title', () => {
    const story: CSVStory = {
      title: '   ',
    };

    const errors = validateStory(story);

    expect(errors).toContain('Title is required');
  });

  it('should report error for title too long', () => {
    const story: CSVStory = {
      title: 'a'.repeat(256),
    };

    const errors = validateStory(story);

    expect(errors).toContain('Title is too long (max 255 characters)');
  });

  it('should report error for invalid URL', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'not-a-url',
    };

    const errors = validateStory(story);

    expect(errors).toContain('External link must be a valid URL');
  });

  it('should report error for URL too long', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'https://example.com/' + 'a'.repeat(500),
    };

    const errors = validateStory(story);

    expect(errors).toContain('External link is too long (max 500 characters)');
  });

  it('should report multiple errors', () => {
    const story: Partial<CSVStory> = {
      external_link: 'not-a-url',
    };

    const errors = validateStory(story);

    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('Title is required');
    expect(errors).toContain('External link must be a valid URL');
  });

  it('should report both title and URL errors', () => {
    const story: Partial<CSVStory> = {
      title: 'a'.repeat(256),
      external_link: 'not-a-valid-url',
    };

    const errors = validateStory(story);

    expect(errors).toContain('Title is too long (max 255 characters)');
    expect(errors).toContain('External link must be a valid URL');
    expect(errors.length).toBe(2);
  });

  it('should report URL too long error', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(500);
    const story: CSVStory = {
      title: 'Story',
      external_link: longUrl,
    };

    const errors = validateStory(story);

    expect(errors).toContain('External link is too long (max 500 characters)');
    expect(errors.length).toBe(1);
  });

  it('should allow story with only title', () => {
    const story: CSVStory = {
      title: 'Simple Story',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should allow valid URL', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'https://valid-url.com',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle HTTP URLs', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'http://example.com',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should accept story with all fields filled', () => {
    const story: CSVStory = {
      title: 'Complete Story',
      description: 'A complete description',
      acceptance_criteria: 'All criteria met',
      external_link: 'https://example.com/ticket',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle empty description', () => {
    const story: CSVStory = {
      title: 'Story',
      description: '',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle empty acceptance criteria', () => {
    const story: CSVStory = {
      title: 'Story',
      acceptance_criteria: '',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle URL with query parameters', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'https://example.com/issue?id=123&status=open',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle URL with fragments', () => {
    const story: CSVStory = {
      title: 'Story',
      external_link: 'https://example.com/page#section',
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });

  it('should handle story with undefined fields', () => {
    const story: CSVStory = {
      title: 'Story',
      description: undefined,
      acceptance_criteria: undefined,
      external_link: undefined,
    };

    const errors = validateStory(story);

    expect(errors).toEqual([]);
  });
});

describe('parseCSVLine', () => {
  it('should parse CSV with various valid formats', () => {
    // Test with various CSV formats to increase coverage
    const csv1 = `title\n"Story 1"`;
    const result1 = parseCSVStories(csv1);
    expect(result1.stories).toHaveLength(1);

    const csv2 = `title,description\n"Story 2","Desc 2"`;
    const result2 = parseCSVStories(csv2);
    expect(result2.stories).toHaveLength(1);

    const csv3 = `title,description,acceptance_criteria\n"Story 3","Desc 3","AC 3"`;
    const result3 = parseCSVStories(csv3);
    expect(result3.stories).toHaveLength(1);
  });

  it('should handle whitespace in fields', () => {
    const csv = `title,description\n"  Story with spaces  ","  Description  "`;
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story with spaces');
  });

  it('should handle CSV with Windows line endings', () => {
    const csv = "title,description\r\n\"Story\",\"Description\"";
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
  });

  it('should handle CSV with unmatched field count', () => {
    const csv = `title,description\n"Story","Desc","Extra field","Another extra"`;
    const result = parseCSVStories(csv);

    // Should still parse the story with the first two fields
    expect(result.stories).toHaveLength(1);
  });

  it('should handle CSV with special characters', () => {
    const csv = `title,description\n"Story with 🎯 emoji","Description with special chars: @#$%"`;
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story with 🎯 emoji');
  });

  it('should handle multiple consecutive commas', () => {
    const csv = `title,description,acceptance_criteria\n"Story",,`;
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Story');
    expect(result.stories[0].description).toBe('');
    expect(result.stories[0].acceptance_criteria).toBe('');
  });

  it('should handle tabs and special whitespace', () => {
    const csv = `title,description\n"Story\twith\ttabs","Description\twith\ttabs"`;
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toContain('\t');
  });

  it('should handle CSV with only whitespace title', () => {
    const csv = `title,description\n"   ","Some description"`;
    const result = parseCSVStories(csv);

    expect(result.errors).toContain('Line 2: Missing title');
    expect(result.stories).toHaveLength(0);
  });

  it('should handle CSV with long but valid title', () => {
    const title = 'a'.repeat(255);
    const csv = `title\n"${title}"`;
    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe(title);
  });

  it('should handle CSV with very long URL exactly at limit', () => {
    const url = 'https://example.com/' + 'a'.repeat(480); // Total 499 chars
    const csv = `title,external_link\n"Story","${url}"`;
    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
  });

  it('should handle description with special characters', () => {
    const csv = `title,description\n"Story","Description with special chars: <>&\\"'@#"`;
    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].description).toContain('<>&');
  });

  it('should handle CSV with only title column and single row', () => {
    const csv = `title\n"Single Story"`;
    const result = parseCSVStories(csv);

    expect(result.errors).toEqual([]);
    expect(result.stories).toHaveLength(1);
    expect(result.stories[0].title).toBe('Single Story');
    expect(result.stories[0].description).toBeUndefined();
    expect(result.stories[0].acceptance_criteria).toBeUndefined();
    expect(result.stories[0].external_link).toBeUndefined();
  });

  it('should preserve original order of stories', () => {
    const csv = `title\n"First"\n"Second"\n"Third"`;
    const result = parseCSVStories(csv);

    expect(result.stories).toHaveLength(3);
    expect(result.stories[0].title).toBe('First');
    expect(result.stories[1].title).toBe('Second');
    expect(result.stories[2].title).toBe('Third');
  });

  it('should handle mixing valid and invalid rows comprehensively', () => {
    const csv = `title,description,acceptance_criteria,external_link
"Valid Story 1","Description 1","AC 1","https://example.com/1"
"","No title",,"https://example.com/2"
"Valid Story 2",,,
"${'a'.repeat(256)}","Too long title",,
"Valid Story 3","Description 3",,"http://example.com"`;

    const result = parseCSVStories(csv);

    // Should have 3 valid stories and 2 errors
    expect(result.stories).toHaveLength(3);
    expect(result.errors).toHaveLength(2);
    expect(result.stories[0].title).toBe('Valid Story 1');
    expect(result.stories[1].title).toBe('Valid Story 2');
    expect(result.stories[2].title).toBe('Valid Story 3');
  });
});
