import { describe, expect, it } from "vitest";
import {
  extractTableOfContents,
  getMarkdownStats,
  hasMarkdownSyntax,
} from "@/lib/markdown-preview";

describe("getMarkdownStats", () => {
  it("should return zeros for empty input", () => {
    const stats = getMarkdownStats("");
    expect(stats.characters).toBe(0);
    expect(stats.words).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.paragraphs).toBe(0);
    expect(stats.headings).toBe(0);
    expect(stats.codeBlocks).toBe(0);
    expect(stats.links).toBe(0);
    expect(stats.images).toBe(0);
    expect(stats.lists).toBe(0);
    expect(stats.blockquotes).toBe(0);
  });

  it("should return zeros for whitespace-only input", () => {
    const stats = getMarkdownStats("   \n\t\n   ");
    expect(stats.characters).toBe(0);
    expect(stats.words).toBe(0);
  });

  it("should count words correctly", () => {
    const stats = getMarkdownStats("Hello world, this is a test.");
    expect(stats.words).toBe(6);
  });

  it("should count characters correctly", () => {
    const stats = getMarkdownStats("Hello");
    expect(stats.characters).toBe(5);
  });

  it("should count lines correctly", () => {
    const markdown = `Line 1
Line 2

Line 3`;
    const stats = getMarkdownStats(markdown);
    expect(stats.lines).toBe(3); // non-empty lines
  });

  it("should count paragraphs correctly", () => {
    const markdown = `First paragraph.

Second paragraph.

Third paragraph.`;
    const stats = getMarkdownStats(markdown);
    expect(stats.paragraphs).toBe(3);
  });

  it("should count headings correctly", () => {
    const markdown = `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
Not a heading`;
    const stats = getMarkdownStats(markdown);
    expect(stats.headings).toBe(6);
  });

  it("should not count invalid headings", () => {
    const markdown = `#NoSpace
##Also not valid
Text with # in middle`;
    const stats = getMarkdownStats(markdown);
    expect(stats.headings).toBe(0);
  });

  it("should count code blocks correctly", () => {
    const markdown = `Some text

\`\`\`javascript
const x = 1;
\`\`\`

More text

\`\`\`python
print("hello")
\`\`\``;
    const stats = getMarkdownStats(markdown);
    expect(stats.codeBlocks).toBe(2);
  });

  it("should count links correctly", () => {
    const markdown = `Check out [Google](https://google.com) and [GitHub](https://github.com).
Here's an image: ![Alt text](https://example.com/image.png)`;
    const stats = getMarkdownStats(markdown);
    expect(stats.links).toBe(2);
    expect(stats.images).toBe(1);
  });

  it("should count images correctly", () => {
    const markdown = `![Image 1](https://example.com/1.png)
![Image 2](https://example.com/2.png)
[Not an image](https://example.com)`;
    const stats = getMarkdownStats(markdown);
    expect(stats.images).toBe(2);
    expect(stats.links).toBe(1);
  });

  it("should count list items correctly", () => {
    const markdown = `- Item 1
- Item 2
* Item 3
+ Item 4
1. Numbered 1
2. Numbered 2`;
    const stats = getMarkdownStats(markdown);
    expect(stats.lists).toBe(6);
  });

  it("should count nested list items", () => {
    const markdown = `- Item 1
  - Nested 1
  - Nested 2
- Item 2`;
    const stats = getMarkdownStats(markdown);
    expect(stats.lists).toBe(4);
  });

  it("should count blockquotes correctly", () => {
    const markdown = `> Quote 1
> Still quote 1
Regular text
> Quote 2`;
    const stats = getMarkdownStats(markdown);
    expect(stats.blockquotes).toBe(3);
  });

  it("should handle complex markdown", () => {
    const markdown = `# Title

This is a **paragraph** with [a link](https://example.com).

## Section

- List item 1
- List item 2

> A blockquote

\`\`\`js
code();
\`\`\``;
    const stats = getMarkdownStats(markdown);
    expect(stats.headings).toBe(2);
    expect(stats.paragraphs).toBeGreaterThan(0);
    expect(stats.links).toBe(1);
    expect(stats.lists).toBe(2);
    expect(stats.blockquotes).toBe(1);
    expect(stats.codeBlocks).toBe(1);
  });
});

describe("hasMarkdownSyntax", () => {
  it("should return false for empty input", () => {
    expect(hasMarkdownSyntax("")).toBe(false);
  });

  it("should return false for whitespace-only input", () => {
    expect(hasMarkdownSyntax("   \n\t")).toBe(false);
  });

  it("should return false for plain text", () => {
    expect(
      hasMarkdownSyntax("Just some plain text without any formatting.")
    ).toBe(false);
  });

  it("should detect headings", () => {
    expect(hasMarkdownSyntax("# Heading")).toBe(true);
    expect(hasMarkdownSyntax("## Heading")).toBe(true);
    expect(hasMarkdownSyntax("### Heading")).toBe(true);
  });

  it("should detect bold text", () => {
    expect(hasMarkdownSyntax("This is **bold** text")).toBe(true);
  });

  it("should detect italic text", () => {
    expect(hasMarkdownSyntax("This is *italic* text")).toBe(true);
  });

  it("should detect links", () => {
    expect(hasMarkdownSyntax("[Link](https://example.com)")).toBe(true);
  });

  it("should detect images", () => {
    expect(hasMarkdownSyntax("![Alt](https://example.com/img.png)")).toBe(true);
  });

  it("should detect code blocks", () => {
    expect(hasMarkdownSyntax("```\ncode\n```")).toBe(true);
  });

  it("should detect inline code", () => {
    expect(hasMarkdownSyntax("Use `code` here")).toBe(true);
  });

  it("should detect unordered lists", () => {
    expect(hasMarkdownSyntax("- Item")).toBe(true);
    expect(hasMarkdownSyntax("* Item")).toBe(true);
    expect(hasMarkdownSyntax("+ Item")).toBe(true);
  });

  it("should detect ordered lists", () => {
    expect(hasMarkdownSyntax("1. First")).toBe(true);
  });

  it("should detect blockquotes", () => {
    expect(hasMarkdownSyntax("> Quote")).toBe(true);
  });

  it("should detect tables", () => {
    expect(hasMarkdownSyntax("| Col 1 | Col 2 |")).toBe(true);
  });

  it("should detect horizontal rules", () => {
    expect(hasMarkdownSyntax("---")).toBe(true);
  });
});

describe("extractTableOfContents", () => {
  it("should return empty array for empty input", () => {
    const toc = extractTableOfContents("");
    expect(toc).toEqual([]);
  });

  it("should return empty array for text without headings", () => {
    const toc = extractTableOfContents("Just some text\nMore text");
    expect(toc).toEqual([]);
  });

  it("should extract single heading", () => {
    const toc = extractTableOfContents("# Hello World");
    expect(toc).toHaveLength(1);
    expect(toc[0]).toEqual({
      level: 1,
      text: "Hello World",
      slug: "hello-world",
    });
  });

  it("should extract multiple headings with different levels", () => {
    const markdown = `# Title
## Section 1
### Subsection
## Section 2`;
    const toc = extractTableOfContents(markdown);
    expect(toc).toHaveLength(4);
    expect(toc[0].level).toBe(1);
    expect(toc[1].level).toBe(2);
    expect(toc[2].level).toBe(3);
    expect(toc[3].level).toBe(2);
  });

  it("should create proper slugs", () => {
    const markdown = `# Hello World
## Test Heading!
### Special @#$ Characters`;
    const toc = extractTableOfContents(markdown);
    expect(toc[0].slug).toBe("hello-world");
    expect(toc[1].slug).toBe("test-heading");
    expect(toc[2].slug).toBe("special-characters");
  });

  it("should handle all heading levels", () => {
    const markdown = `# H1
## H2
### H3
#### H4
##### H5
###### H6`;
    const toc = extractTableOfContents(markdown);
    expect(toc).toHaveLength(6);
    expect(toc[0].level).toBe(1);
    expect(toc[1].level).toBe(2);
    expect(toc[2].level).toBe(3);
    expect(toc[3].level).toBe(4);
    expect(toc[4].level).toBe(5);
    expect(toc[5].level).toBe(6);
  });

  it("should ignore non-heading lines", () => {
    const markdown = `# Title
Some paragraph text
## Section
- List item
### Subsection
> Quote`;
    const toc = extractTableOfContents(markdown);
    expect(toc).toHaveLength(3);
  });

  it("should not match invalid headings", () => {
    const markdown = `#NoSpace
## Valid
##Invalid
### Also Valid`;
    const toc = extractTableOfContents(markdown);
    expect(toc).toHaveLength(2);
    expect(toc[0].text).toBe("Valid");
    expect(toc[1].text).toBe("Also Valid");
  });

  it("should handle headings with special markdown characters", () => {
    const markdown = `# Hello **World**
## Code \`example\``;
    const toc = extractTableOfContents(markdown);
    expect(toc[0].text).toBe("Hello **World**");
    expect(toc[1].text).toBe("Code `example`");
  });

  it("should create lowercase slugs", () => {
    const toc = extractTableOfContents("# UPPERCASE HEADING");
    expect(toc[0].slug).toBe("uppercase-heading");
  });

  it("should handle multiple spaces in headings", () => {
    const toc = extractTableOfContents("# Hello    World");
    expect(toc[0].text).toBe("Hello    World");
    expect(toc[0].slug).toBe("hello-world"); // multiple spaces become single dash due to -+ replacement
  });
});
