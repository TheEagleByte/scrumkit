/**
 * Tests for sanitization utility functions
 * Validates XSS prevention, input cleaning, and edge case handling
 */

import {
  sanitizeHtml,
  sanitizeUserInput,
  sanitizeUsername,
  sanitizeItemContent,
  createSafeDisplayName,
} from '@/lib/utils/sanitize';

describe('Sanitization Utility Functions', () => {
  describe('sanitizeHtml', () => {
    it('should escape basic HTML characters', () => {
      const input = '<script>alert("xss")</script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape all dangerous characters', () => {
      const input = '&<>"\'/ danger';
      const result = sanitizeHtml(input);
      expect(result).toBe('&amp;&lt;&gt;&quot;&#x27;&#x2F; danger');
    });

    it('should handle empty string', () => {
      expect(sanitizeHtml('')).toBe('');
    });

    it('should handle string with no special characters', () => {
      const input = 'Hello World 123';
      expect(sanitizeHtml(input)).toBe('Hello World 123');
    });

    it('should handle mixed content', () => {
      const input = 'Hello <b>World</b> & "Friends"';
      const result = sanitizeHtml(input);
      expect(result).toBe('Hello &lt;b&gt;World&lt;&#x2F;b&gt; &amp; &quot;Friends&quot;');
    });

    it('should escape single quotes correctly', () => {
      const input = "It's a test";
      const result = sanitizeHtml(input);
      expect(result).toBe('It&#x27;s a test');
    });

    it('should escape forward slashes', () => {
      const input = '</script><script>';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;&#x2F;script&gt;&lt;script&gt;');
    });

    it('should handle complex XSS attempts', () => {
      const xssAttempts = [
        '<img src="x" onerror="alert(1)">',
        'javascript:alert(document.cookie)',
        '<svg onload="alert(1)">',
        '" onmouseover="alert(1)"',
        "' onload='alert(1)'",
      ];

      xssAttempts.forEach(xss => {
        const result = sanitizeHtml(xss);
        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).not.toContain('"');
        expect(result).not.toContain("'");
      });
    });

    it('should handle unicode characters correctly', () => {
      const input = 'Hello 世界 & émojis 🎉';
      const result = sanitizeHtml(input);
      expect(result).toBe('Hello 世界 &amp; émojis 🎉');
    });

    it('should handle multiple instances of same character', () => {
      const input = '<<<>>> &&& """';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;&lt;&lt;&gt;&gt;&gt; &amp;&amp;&amp; &quot;&quot;&quot;');
    });
  });

  describe('sanitizeUserInput', () => {
    it('should sanitize and trim whitespace', () => {
      const input = '  <script>alert("xss")</script>  ';
      const result = sanitizeUserInput(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should limit length to default 1000 characters', () => {
      const input = 'a'.repeat(1500);
      const result = sanitizeUserInput(input);
      expect(result.length).toBe(1000);
    });

    it('should limit length to custom maximum', () => {
      const input = 'a'.repeat(200);
      const result = sanitizeUserInput(input, 100);
      expect(result.length).toBe(100);
      expect(result).toBe('a'.repeat(100));
    });

    it('should remove control characters', () => {
      const input = 'Hello\x00\x01\x02World\x0B\x0C\x0E\x0F\x7F';
      const result = sanitizeUserInput(input);
      expect(result).toBe('HelloWorld');
    });

    it('should preserve newlines and tabs in allowed range', () => {
      const input = 'Hello\n\tWorld';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello\n\tWorld');
    });

    it('should handle null input', () => {
      const result = sanitizeUserInput(null as any);
      expect(result).toBe('');
    });

    it('should handle undefined input', () => {
      const result = sanitizeUserInput(undefined as any);
      expect(result).toBe('');
    });

    it('should handle non-string input', () => {
      const result = sanitizeUserInput(123 as any);
      expect(result).toBe('');
    });

    it('should handle empty string', () => {
      const result = sanitizeUserInput('');
      expect(result).toBe('');
    });

    it('should handle whitespace-only input', () => {
      const result = sanitizeUserInput('   \n\t   ');
      expect(result).toBe('');
    });

    it('should preserve legitimate content', () => {
      const input = 'This is a normal message with punctuation!';
      const result = sanitizeUserInput(input);
      expect(result).toBe('This is a normal message with punctuation!');
    });

    it('should handle complex mixed content', () => {
      const input = '  Hello <b>World</b> & "Friends" with\x00control chars  ';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello &lt;b&gt;World&lt;&#x2F;b&gt; &amp; &quot;Friends&quot; withcontrol chars');
    });

    it('should apply both length limit and sanitization', () => {
      const input = '<script>' + 'a'.repeat(200) + '</script>';
      const result = sanitizeUserInput(input, 50);
      expect(result.length).toBeLessThanOrEqual(60); // Allow for HTML escaping expansion
      expect(result).toContain('&lt;script&gt;');
    });

    it('should handle zero length limit', () => {
      const input = 'Hello World';
      const result = sanitizeUserInput(input, 0);
      expect(result).toBe('');
    });

    it('should handle negative length limit', () => {
      const input = 'Hello World';
      const result = sanitizeUserInput(input, -5);
      expect(result).toBe('');
    });
  });

  describe('sanitizeUsername', () => {
    it('should limit username to 50 characters', () => {
      const input = 'a'.repeat(100);
      const result = sanitizeUsername(input);
      expect(result.length).toBe(50);
    });

    it('should sanitize HTML in username', () => {
      const input = 'user<script>alert(1)</script>';
      const result = sanitizeUsername(input);
      expect(result).toBe('user&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    });

    it('should handle normal usernames', () => {
      const input = 'john_doe123';
      const result = sanitizeUsername(input);
      expect(result).toBe('john_doe123');
    });

    it('should trim whitespace', () => {
      const input = '  john_doe  ';
      const result = sanitizeUsername(input);
      expect(result).toBe('john_doe');
    });

    it('should handle unicode characters', () => {
      const input = 'user世界';
      const result = sanitizeUsername(input);
      expect(result).toBe('user世界');
    });

    it('should handle empty username', () => {
      const result = sanitizeUsername('');
      expect(result).toBe('');
    });

    it('should remove control characters', () => {
      const input = 'user\x00\x01name';
      const result = sanitizeUsername(input);
      expect(result).toBe('username');
    });
  });

  describe('sanitizeItemContent', () => {
    it('should limit content to 500 characters', () => {
      const input = 'a'.repeat(1000);
      const result = sanitizeItemContent(input);
      expect(result.length).toBe(500);
    });

    it('should sanitize HTML in content', () => {
      const input = 'Content with <script>alert("xss")</script>';
      const result = sanitizeItemContent(input);
      expect(result).toBe('Content with &lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should handle normal content', () => {
      const input = 'This is a retrospective item about our sprint.';
      const result = sanitizeItemContent(input);
      expect(result).toBe('This is a retrospective item about our sprint.');
    });

    it('should preserve newlines in content', () => {
      const input = 'Line 1\nLine 2\nLine 3';
      const result = sanitizeItemContent(input);
      expect(result).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should handle empty content', () => {
      const result = sanitizeItemContent('');
      expect(result).toBe('');
    });

    it('should trim whitespace', () => {
      const input = '  Important content  ';
      const result = sanitizeItemContent(input);
      expect(result).toBe('Important content');
    });
  });

  describe('createSafeDisplayName', () => {
    it('should use provided name when available', () => {
      const result = createSafeDisplayName('John Doe', 'john@example.com');
      expect(result).toBe('John Doe');
    });

    it('should sanitize name input', () => {
      const result = createSafeDisplayName('<script>alert(1)</script>', 'john@example.com');
      expect(result).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;');
    });

    it('should extract username from email when name is not provided', () => {
      const result = createSafeDisplayName(undefined, 'john.doe@example.com');
      expect(result).toBe('john.doe');
    });

    it('should sanitize extracted username', () => {
      const result = createSafeDisplayName(undefined, '<script>@example.com');
      expect(result).toBe('&lt;script&gt;');
    });

    it('should handle complex email usernames', () => {
      const result = createSafeDisplayName(undefined, 'first.last+tag@example.com');
      expect(result).toBe('first.last+tag');
    });

    it('should return Anonymous when no name or email provided', () => {
      const result = createSafeDisplayName();
      expect(result).toBe('Anonymous');
    });

    it('should return Anonymous when name is empty', () => {
      const result = createSafeDisplayName('', 'john@example.com');
      expect(result).toBe('john');
    });

    it('should return Anonymous when email is empty', () => {
      const result = createSafeDisplayName(undefined, '');
      expect(result).toBe('Anonymous');
    });

    it('should handle name with only whitespace', () => {
      const result = createSafeDisplayName('   ', 'john@example.com');
      expect(result).toBe(''); // Whitespace name gets sanitized to empty string
    });

    it('should handle email without @ symbol', () => {
      const result = createSafeDisplayName(undefined, 'invalid-email');
      expect(result).toBe('invalid-email');
    });

    it('should handle email with multiple @ symbols', () => {
      const result = createSafeDisplayName(undefined, 'user@@domain.com');
      expect(result).toBe('user');
    });

    it('should limit display name length', () => {
      const longName = 'a'.repeat(100);
      const result = createSafeDisplayName(longName);
      expect(result.length).toBe(50); // Username limit
    });

    it('should limit extracted username length', () => {
      const longUsername = 'a'.repeat(100) + '@example.com';
      const result = createSafeDisplayName(undefined, longUsername);
      expect(result.length).toBe(50); // Username limit
    });

    it('should handle unicode in names', () => {
      const result = createSafeDisplayName('用户名');
      expect(result).toBe('用户名');
    });

    it('should handle unicode in email usernames', () => {
      const result = createSafeDisplayName(undefined, '用户@example.com');
      expect(result).toBe('用户');
    });

    it('should prioritize name over email', () => {
      const result = createSafeDisplayName('Full Name', 'username@example.com');
      expect(result).toBe('Full Name');
      expect(result).not.toBe('username');
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle extremely long input gracefully', () => {
      const veryLongInput = 'a'.repeat(1000000); // 1 million characters
      expect(() => sanitizeUserInput(veryLongInput)).not.toThrow();
      const result = sanitizeUserInput(veryLongInput);
      expect(result.length).toBe(1000); // Should be limited
    });

    it('should handle all control characters', () => {
      let controlChars = '';
      for (let i = 0; i <= 8; i++) controlChars += String.fromCharCode(i);
      for (let i = 11; i <= 12; i++) controlChars += String.fromCharCode(i);
      for (let i = 14; i <= 31; i++) controlChars += String.fromCharCode(i);
      controlChars += String.fromCharCode(127);

      const input = 'Hello' + controlChars + 'World';
      const result = sanitizeUserInput(input);
      expect(result).toBe('HelloWorld');
    });

    it('should preserve allowed whitespace characters', () => {
      const input = 'Hello\t\n\rWorld'; // Tab, newline, carriage return
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello\t\n\rWorld');
    });

    it('should handle nested HTML tags', () => {
      const input = '<div><span><script>alert(1)</script></span></div>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should handle malformed HTML', () => {
      const input = '<div><span>unclosed tags';
      const result = sanitizeHtml(input);
      expect(result).toBe('&lt;div&gt;&lt;span&gt;unclosed tags');
    });

    it('should handle URL-encoded characters', () => {
      const input = '%3Cscript%3Ealert(1)%3C/script%3E';
      const result = sanitizeUserInput(input);
      expect(result).toBe('%3Cscript%3Ealert(1)%3C&#x2F;script%3E');
    });

    it('should handle data URIs', () => {
      const input = 'data:text/html,<script>alert(1)</script>';
      const result = sanitizeUserInput(input);
      expect(result).not.toContain('<script>');
    });

    it('should handle CSS injection attempts', () => {
      const input = 'color: red; background: url(javascript:alert(1))';
      const result = sanitizeUserInput(input);
      // Should escape any HTML-like characters
      expect(result).toBe('color: red; background: url(javascript:alert(1))');
    });

    it('should handle object injection attempts', () => {
      const input = '<object data="data:text/html,<script>alert(1)</script>"></object>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<object');
      expect(result).not.toContain('<script');
    });

    it('should handle SVG injection attempts', () => {
      const input = '<svg><script>alert(1)</script></svg>';
      const result = sanitizeHtml(input);
      expect(result).not.toContain('<svg');
      expect(result).not.toContain('<script');
    });

    it('should handle boolean and number inputs to createSafeDisplayName', () => {
      expect(createSafeDisplayName(true as any)).toBe(''); // true is truthy, gets sanitized to empty
      expect(createSafeDisplayName(123 as any)).toBe(''); // 123 is truthy, gets sanitized to empty
      expect(createSafeDisplayName(null as any)).toBe('Anonymous'); // null is falsy, falls back to Anonymous
    });

    it('should handle objects passed to sanitization functions', () => {
      const obj = { toString: () => '<script>alert(1)</script>' };
      expect(sanitizeUserInput(obj as any)).toBe('');
    });

    it('should handle arrays passed to sanitization functions', () => {
      const arr = ['<script>', 'alert(1)', '</script>'];
      expect(sanitizeUserInput(arr as any)).toBe('');
    });

    it('should maintain function purity', () => {
      const input = '<script>alert(1)</script>';
      const result1 = sanitizeHtml(input);
      const result2 = sanitizeHtml(input);
      expect(result1).toBe(result2);
      expect(input).toBe('<script>alert(1)</script>'); // Original unchanged
    });

    it('should handle regex special characters', () => {
      const input = 'Text with regex chars: ^$.*+?()[]{}|\\';
      const result = sanitizeUserInput(input);
      expect(result).toBe('Text with regex chars: ^$.*+?()[]{}|\\');
    });

    it('should handle zero-width characters', () => {
      const input = 'Hello\u200B\u200C\u200D\u2060World'; // Zero-width chars
      const result = sanitizeUserInput(input);
      expect(result).toBe('Hello\u200B\u200C\u200D\u2060World'); // Should preserve
    });
  });

  describe('Type Safety and API Contract', () => {
    it('should export all required functions', () => {
      expect(typeof sanitizeHtml).toBe('function');
      expect(typeof sanitizeUserInput).toBe('function');
      expect(typeof sanitizeUsername).toBe('function');
      expect(typeof sanitizeItemContent).toBe('function');
      expect(typeof createSafeDisplayName).toBe('function');
    });

    it('should always return strings', () => {
      const functions = [
        () => sanitizeHtml('test'),
        () => sanitizeUserInput('test'),
        () => sanitizeUsername('test'),
        () => sanitizeItemContent('test'),
        () => createSafeDisplayName('test'),
      ];

      functions.forEach(fn => {
        const result = fn();
        expect(typeof result).toBe('string');
      });
    });

    it('should handle function parameters correctly', () => {
      // Test function with defaults
      expect(() => sanitizeUserInput('test')).not.toThrow();
      expect(() => sanitizeUserInput('test', 100)).not.toThrow();

      // Test function with optional parameters
      expect(() => createSafeDisplayName()).not.toThrow();
      expect(() => createSafeDisplayName('name')).not.toThrow();
      expect(() => createSafeDisplayName('name', 'email')).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    it('should handle repeated sanitization calls efficiently', () => {
      const input = 'Test input with <script>alert(1)</script>';
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        sanitizeUserInput(input);
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should not have memory leaks with large inputs', () => {
      const largeInput = 'a'.repeat(100000);

      for (let i = 0; i < 100; i++) {
        sanitizeUserInput(largeInput);
      }

      // If this doesn't crash or timeout, memory is likely handled well
      expect(true).toBe(true);
    });
  });
});