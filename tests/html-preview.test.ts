import { describe, expect, it } from "vitest";
import {
  createPreviewDocument,
  formatHtml,
  getHtmlStats,
  minifyHtml,
  validateHtml,
  viewportPresets,
} from "@/lib/html-preview";

describe("getHtmlStats", () => {
  it("should return zeros for empty input", () => {
    const stats = getHtmlStats("");
    expect(stats.elements).toBe(0);
    expect(stats.characters).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.hasHead).toBe(false);
    expect(stats.hasBody).toBe(false);
    expect(stats.hasStyles).toBe(false);
    expect(stats.hasScripts).toBe(false);
    expect(stats.images).toBe(0);
    expect(stats.links).toBe(0);
  });

  it("should return zeros for whitespace-only input", () => {
    const stats = getHtmlStats("   \n\t\n   ");
    expect(stats.elements).toBe(0);
    expect(stats.characters).toBe(0);
  });

  it("should count elements correctly", () => {
    const html = "<div><p>Hello</p><span>World</span></div>";
    const stats = getHtmlStats(html);
    expect(stats.elements).toBe(3);
  });

  it("should count characters correctly", () => {
    const html = "<p>Hello</p>";
    const stats = getHtmlStats(html);
    expect(stats.characters).toBe(12);
  });

  it("should count lines correctly", () => {
    const html = `<div>
  <p>Hello</p>
  <p>World</p>
</div>`;
    const stats = getHtmlStats(html);
    expect(stats.lines).toBe(4);
  });

  it("should detect head tag", () => {
    const html = "<html><head><title>Test</title></head><body></body></html>";
    const stats = getHtmlStats(html);
    expect(stats.hasHead).toBe(true);
  });

  it("should detect body tag", () => {
    const html = "<html><body><p>Content</p></body></html>";
    const stats = getHtmlStats(html);
    expect(stats.hasBody).toBe(true);
  });

  it("should detect style tags", () => {
    const html = "<style>body { color: red; }</style>";
    const stats = getHtmlStats(html);
    expect(stats.hasStyles).toBe(true);
  });

  it("should detect inline styles", () => {
    const html = '<div style="color: red;">Hello</div>';
    const stats = getHtmlStats(html);
    expect(stats.hasStyles).toBe(true);
  });

  it("should detect script tags", () => {
    const html = "<script>console.log('hello');</script>";
    const stats = getHtmlStats(html);
    expect(stats.hasScripts).toBe(true);
  });

  it("should count images correctly", () => {
    const html =
      '<img src="a.jpg"><img src="b.png" alt="test"><img src="c.gif"/>';
    const stats = getHtmlStats(html);
    expect(stats.images).toBe(3);
  });

  it("should count links correctly", () => {
    const html = '<a href="#">Link 1</a><a href="/">Link 2</a>';
    const stats = getHtmlStats(html);
    expect(stats.links).toBe(2);
  });

  it("should handle complex HTML", () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Test</title>
  <style>body { margin: 0; }</style>
</head>
<body>
  <div>
    <h1>Hello World</h1>
    <p>This is a test.</p>
    <a href="#">Link</a>
    <img src="test.jpg" alt="Test">
  </div>
  <script>console.log('test');</script>
</body>
</html>`;
    const stats = getHtmlStats(html);
    expect(stats.elements).toBeGreaterThan(5);
    expect(stats.hasHead).toBe(true);
    expect(stats.hasBody).toBe(true);
    expect(stats.hasStyles).toBe(true);
    expect(stats.hasScripts).toBe(true);
    expect(stats.images).toBe(1);
    expect(stats.links).toBe(1);
  });
});

describe("validateHtml", () => {
  it("should return valid for empty input", () => {
    const result = validateHtml("");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("should return valid for whitespace-only input", () => {
    const result = validateHtml("   \n\t");
    expect(result.isValid).toBe(true);
  });

  it("should validate simple valid HTML", () => {
    const result = validateHtml("<div><p>Hello</p></div>");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect unclosed tags", () => {
    const result = validateHtml("<div><p>Hello</div>");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("should handle self-closing tags", () => {
    const result = validateHtml('<img src="test.jpg"><br><hr>');
    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  it("should handle void elements", () => {
    const result = validateHtml(
      '<meta charset="UTF-8"><link rel="stylesheet"><input type="text">'
    );
    expect(result.isValid).toBe(true);
  });

  it("should warn about script tags", () => {
    const result = validateHtml("<script>alert('hello');</script>");
    expect(result.warnings.some((w) => w.includes("script"))).toBe(true);
  });

  it("should handle nested elements correctly", () => {
    const result = validateHtml(
      "<div><ul><li>Item 1</li><li>Item 2</li></ul></div>"
    );
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should handle multiple levels of nesting", () => {
    const result = validateHtml(`
      <html>
        <head><title>Test</title></head>
        <body>
          <div>
            <header>
              <nav><ul><li><a href="#">Link</a></li></ul></nav>
            </header>
          </div>
        </body>
      </html>
    `);
    expect(result.isValid).toBe(true);
  });
});

describe("formatHtml", () => {
  it("should return empty string for empty input", () => {
    expect(formatHtml("")).toBe("");
    expect(formatHtml("   ")).toBe("");
  });

  it("should format simple HTML with default indent", () => {
    const input = "<div><p>Hello</p></div>";
    const formatted = formatHtml(input);
    expect(formatted).toContain("<div>");
    expect(formatted).toContain("<p>");
  });

  it("should handle doctype", () => {
    const input = "<!DOCTYPE html><html><body></body></html>";
    const formatted = formatHtml(input);
    expect(formatted.startsWith("<!DOCTYPE html>")).toBe(true);
  });

  it("should use custom indent size", () => {
    const input = "<div><p>Hello</p></div>";
    const formatted = formatHtml(input, 4);
    expect(formatted).toContain("    "); // 4 spaces
  });

  it("should handle self-closing tags", () => {
    const input = '<div><img src="test.jpg"/><br></div>';
    const formatted = formatHtml(input);
    expect(formatted).toContain("img");
    expect(formatted).toContain("br");
  });

  it("should keep inline elements together", () => {
    const input = "<p>Hello <strong>World</strong></p>";
    const formatted = formatHtml(input);
    // Inline elements should be handled gracefully
    expect(formatted).toContain("strong");
  });
});

describe("minifyHtml", () => {
  it("should return empty string for empty input", () => {
    expect(minifyHtml("")).toBe("");
    expect(minifyHtml("   ")).toBe("");
  });

  it("should remove whitespace between tags", () => {
    const input = "<div>   <p>   Hello   </p>   </div>";
    const minified = minifyHtml(input);
    expect(minified).not.toContain("   ");
  });

  it("should collapse multiple spaces", () => {
    const input = "<p>Hello     World</p>";
    const minified = minifyHtml(input);
    expect(minified).toBe("<p>Hello World</p>");
  });

  it("should remove newlines", () => {
    const input = `<div>
      <p>Hello</p>
    </div>`;
    const minified = minifyHtml(input);
    expect(minified).not.toContain("\n");
  });

  it("should handle complex HTML", () => {
    const input = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Test</title>
      </head>
      <body>
        <div>
          <p>Hello World</p>
        </div>
      </body>
    </html>
    `;
    const minified = minifyHtml(input);
    expect(minified.length).toBeLessThan(input.length);
    expect(minified).toContain("<!DOCTYPE html>");
    expect(minified).toContain("<html>");
    expect(minified).toContain("</html>");
  });
});

describe("createPreviewDocument", () => {
  it("should wrap partial HTML in a complete document", () => {
    const input = "<h1>Hello</h1>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<html");
    expect(result).toContain("<head>");
    expect(result).toContain("<body>");
    expect(result).toContain("<h1>Hello</h1>");
  });

  it("should add light theme class", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain('class="light"');
  });

  it("should add dark theme class", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, true);
    expect(result).toContain('class="dark"');
  });

  it("should inject theme styles", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain("__preview_theme__");
    expect(result).toContain("background-color");
  });

  it("should handle complete HTML documents", () => {
    const input = `<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><p>Hello</p></body>
</html>`;
    const result = createPreviewDocument(input, false);
    expect(result).toContain('class="light"');
    expect(result).toContain("__preview_theme__");
  });

  it("should add dark mode styles when dark is true", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, true);
    expect(result).toContain("#1a1a1a"); // dark background color
    expect(result).toContain("#e5e5e5"); // dark text color
  });

  it("should add light mode styles when dark is false", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain("#ffffff"); // light background color
    expect(result).toContain("#171717"); // light text color
  });

  it("should include viewport meta tag", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain('name="viewport"');
    expect(result).toContain("width=device-width");
  });

  it("should include charset meta tag", () => {
    const input = "<p>Test</p>";
    const result = createPreviewDocument(input, false);
    expect(result).toContain('charset="UTF-8"');
  });
});

describe("viewportPresets", () => {
  it("should have mobile preset", () => {
    expect(viewportPresets.mobile).toBeDefined();
    expect(viewportPresets.mobile.width).toBe(375);
    expect(viewportPresets.mobile.height).toBe(667);
    expect(viewportPresets.mobile.label).toBeTruthy();
  });

  it("should have tablet preset", () => {
    expect(viewportPresets.tablet).toBeDefined();
    expect(viewportPresets.tablet.width).toBe(768);
    expect(viewportPresets.tablet.height).toBe(1024);
    expect(viewportPresets.tablet.label).toBeTruthy();
  });

  it("should have desktop preset", () => {
    expect(viewportPresets.desktop).toBeDefined();
    expect(viewportPresets.desktop.width).toBe(1280);
    expect(viewportPresets.desktop.height).toBe(800);
    expect(viewportPresets.desktop.label).toBeTruthy();
  });

  it("should have increasing widths from mobile to desktop", () => {
    expect(viewportPresets.mobile.width).toBeLessThan(
      viewportPresets.tablet.width
    );
    expect(viewportPresets.tablet.width).toBeLessThan(
      viewportPresets.desktop.width
    );
  });
});
