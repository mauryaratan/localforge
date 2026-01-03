/**
 * Markdown Preview utilities
 * Provides helper functions for markdown statistics and example content
 */

export interface MarkdownStats {
  characters: number;
  words: number;
  lines: number;
  paragraphs: number;
  headings: number;
  codeBlocks: number;
  links: number;
  images: number;
  lists: number;
  blockquotes: number;
}

/**
 * Calculate statistics for markdown content
 */
export const getMarkdownStats = (markdown: string): MarkdownStats => {
  if (!markdown.trim()) {
    return {
      characters: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      headings: 0,
      codeBlocks: 0,
      links: 0,
      images: 0,
      lists: 0,
      blockquotes: 0,
    };
  }

  const lines = markdown.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim().length > 0);

  // Count words (split by whitespace, filter empty)
  const words = markdown
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Count paragraphs (separated by blank lines)
  const paragraphs = markdown
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0).length;

  // Count headings (lines starting with #)
  const headings = lines.filter((line) => /^#{1,6}\s/.test(line.trim())).length;

  // Count fenced code blocks (```)
  const codeBlockMatches = markdown.match(/```/g);
  const codeBlocks = codeBlockMatches ? Math.floor(codeBlockMatches.length / 2) : 0;

  // Count links [text](url) - exclude images
  const linkMatches = markdown.match(/(?<!!)\[([^\]]+)\]\(([^)]+)\)/g);
  const links = linkMatches ? linkMatches.length : 0;

  // Count images ![alt](url)
  const imageMatches = markdown.match(/!\[([^\]]*)\]\(([^)]+)\)/g);
  const images = imageMatches ? imageMatches.length : 0;

  // Count list items (lines starting with -, *, +, or numbered)
  const lists = lines.filter((line) =>
    /^\s*[-*+]\s|^\s*\d+\.\s/.test(line)
  ).length;

  // Count blockquotes (lines starting with >)
  const blockquotes = lines.filter((line) => /^\s*>/.test(line)).length;

  return {
    characters: markdown.length,
    words,
    lines: nonEmptyLines.length,
    paragraphs,
    headings,
    codeBlocks,
    links,
    images,
    lists,
    blockquotes,
  };
};

/**
 * Check if content looks like valid markdown (has markdown-specific syntax)
 */
export const hasMarkdownSyntax = (content: string): boolean => {
  if (!content.trim()) {
    return false;
  }

  const markdownPatterns = [
    /^#{1,6}\s/m, // Headings
    /\*\*[^*]+\*\*/m, // Bold
    /\*[^*]+\*/m, // Italic
    /\[([^\]]+)\]\(([^)]+)\)/m, // Links
    /!\[([^\]]*)\]\(([^)]+)\)/m, // Images
    /```[\s\S]*?```/m, // Code blocks
    /`[^`]+`/m, // Inline code
    /^\s*[-*+]\s/m, // Unordered lists
    /^\s*\d+\.\s/m, // Ordered lists
    /^\s*>/m, // Blockquotes
    /^\s*---\s*$/m, // Horizontal rule
    /\|.*\|/m, // Tables
  ];

  return markdownPatterns.some((pattern) => pattern.test(content));
};

/**
 * Extract table of contents from markdown headings
 */
export interface TocItem {
  level: number;
  text: string;
  slug: string;
}

export const extractTableOfContents = (markdown: string): TocItem[] => {
  const lines = markdown.split("\n");
  const toc: TocItem[] = [];

  for (const line of lines) {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      // Create a URL-friendly slug
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      toc.push({ level, text, slug });
    }
  }

  return toc;
};

// Example markdown content for quick testing
export const exampleMarkdown = {
  basic: `# Hello World

This is a **basic** markdown example with *italic* and **bold** text.

## Features

- Simple formatting
- Easy to read
- Widely supported

> This is a blockquote with some wisdom.

Learn more at [Markdown Guide](https://www.markdownguide.org).`,

  readme: `# Project Name

A brief description of what this project does.

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## Usage

\`\`\`javascript
import { something } from 'my-package';

const result = something();
console.log(result);
\`\`\`

## Features

- Feature 1
- Feature 2  
- Feature 3

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT`,

  table: `# Data Table Example

| Name | Type | Description |
|------|------|-------------|
| id | number | Unique identifier |
| name | string | Display name |
| active | boolean | Status flag |

## Notes

- Tables require GFM (GitHub Flavored Markdown)
- Alignment can be set with colons
- Pipes don't need to be aligned`,

  comprehensive: `# Comprehensive Markdown Demo

## Text Formatting

This paragraph shows **bold text**, *italic text*, and ***bold italic***. You can also use ~~strikethrough~~ for deleted content.

## Headings

### This is H3
#### This is H4
##### This is H5
###### This is H6

## Lists

### Unordered List

- First item
- Second item
  - Nested item
  - Another nested
- Third item

### Ordered List

1. First step
2. Second step
3. Third step

### Task List

- [x] Completed task
- [ ] Pending task
- [ ] Another task

## Code

Inline \`code\` looks like this.

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = async (id: number): Promise<User> => {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
};
\`\`\`

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Links & Images

[Visit GitHub](https://github.com)

![Placeholder Image](https://via.placeholder.com/150)

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Parsing | ✅ | Complete |
| Preview | ✅ | Live updates |
| Export | 🚧 | In progress |

## Horizontal Rule

---

## Footnotes

Here's a sentence with a footnote[^1].

[^1]: This is the footnote content.

## Math (if supported)

Inline math: $E = mc^2$

Block math:
$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$`,
};

// Example labels for UI
export const exampleLabels: Record<keyof typeof exampleMarkdown, string> = {
  basic: "Basic Example",
  readme: "README Template",
  table: "Table Example",
  comprehensive: "Full Demo",
};
