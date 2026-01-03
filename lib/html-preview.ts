/**
 * HTML Preview utilities
 * Provides helper functions for HTML validation, formatting, and statistics
 */

export interface HtmlStats {
  elements: number;
  characters: number;
  lines: number;
  hasHead: boolean;
  hasBody: boolean;
  hasStyles: boolean;
  hasScripts: boolean;
  images: number;
  links: number;
}

/**
 * Get statistics about HTML content
 */
export const getHtmlStats = (html: string): HtmlStats => {
  if (!html.trim()) {
    return {
      elements: 0,
      characters: 0,
      lines: 0,
      hasHead: false,
      hasBody: false,
      hasStyles: false,
      hasScripts: false,
      images: 0,
      links: 0,
    };
  }

  // Count opening tags (elements)
  const elementMatches = html.match(/<[a-zA-Z][a-zA-Z0-9]*[^>]*>/g);
  const elements = elementMatches ? elementMatches.length : 0;

  // Count lines
  const lines = html.split("\n").filter((line) => line.trim()).length;

  // Check for specific elements
  const hasHead = /<head[^>]*>/i.test(html);
  const hasBody = /<body[^>]*>/i.test(html);
  const hasStyles = /<style[^>]*>/i.test(html) || /style\s*=/i.test(html);
  const hasScripts = /<script[^>]*>/i.test(html);

  // Count images
  const imageMatches = html.match(/<img[^>]*>/gi);
  const images = imageMatches ? imageMatches.length : 0;

  // Count links
  const linkMatches = html.match(/<a[^>]*>/gi);
  const links = linkMatches ? linkMatches.length : 0;

  return {
    elements,
    characters: html.length,
    lines,
    hasHead,
    hasBody,
    hasStyles,
    hasScripts,
    images,
    links,
  };
};

/**
 * Basic HTML validation
 */
export interface HtmlValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export const validateHtml = (html: string): HtmlValidationResult => {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!html.trim()) {
    return { isValid: true, warnings: [], errors: [] };
  }

  // Check for unclosed tags (basic check)
  const openingTags: string[] = [];
  const selfClosingTags = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  // Find all tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*\/?>/g;
  let match: RegExpExecArray | null = null;

  while ((match = tagRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (selfClosingTags.has(tagName) || fullTag.endsWith("/>")) {
      continue;
    }

    if (fullTag.startsWith("</")) {
      // Closing tag
      const lastOpened = openingTags.pop();
      if (lastOpened !== tagName) {
        if (lastOpened) {
          errors.push(
            `Unexpected closing tag </${tagName}>, expected </${lastOpened}>`
          );
          openingTags.push(lastOpened); // Put it back
        } else {
          errors.push(`Unexpected closing tag </${tagName}>`);
        }
      }
    } else {
      // Opening tag
      openingTags.push(tagName);
    }
  }

  // Unclosed tags
  for (const tag of openingTags) {
    warnings.push(`Unclosed tag: <${tag}>`);
  }

  // Check for common issues
  if (/<script[^>]*>/i.test(html)) {
    warnings.push("Contains <script> tags - will be executed in preview");
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
  };
};

/**
 * Format HTML with proper indentation
 */
export const formatHtml = (html: string, indentSize = 2): string => {
  if (!html.trim()) {
    return "";
  }

  const indent = " ".repeat(indentSize);
  let formatted = "";
  let depth = 0;

  // Split by tags
  const tokens = html.split(/(<[^>]+>)/g).filter(Boolean);

  const selfClosing = new Set([
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ]);

  const inlineTags = new Set([
    "a",
    "span",
    "strong",
    "em",
    "b",
    "i",
    "code",
    "small",
    "sub",
    "sup",
  ]);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith("<!") || trimmed.startsWith("<?")) {
      // Doctype or XML declaration
      formatted += trimmed + "\n";
      continue;
    }

    if (trimmed.startsWith("</")) {
      // Closing tag
      depth = Math.max(0, depth - 1);
      const tagName = trimmed.match(/<\/([a-zA-Z0-9]+)/)?.[1]?.toLowerCase();
      if (tagName && inlineTags.has(tagName)) {
        formatted = formatted.trimEnd() + trimmed;
      } else {
        formatted += indent.repeat(depth) + trimmed + "\n";
      }
    } else if (trimmed.startsWith("<")) {
      // Opening tag or self-closing
      const tagName = trimmed.match(/<([a-zA-Z0-9]+)/)?.[1]?.toLowerCase();
      const isSelfClosing =
        (tagName && selfClosing.has(tagName)) || trimmed.endsWith("/>");

      if (tagName && inlineTags.has(tagName)) {
        formatted = formatted.trimEnd() + trimmed;
      } else {
        formatted += indent.repeat(depth) + trimmed + "\n";
      }

      if (!isSelfClosing && tagName && !selfClosing.has(tagName)) {
        depth++;
      }
    } else {
      // Text content
      formatted += indent.repeat(depth) + trimmed + "\n";
    }
  }

  return formatted.trim();
};

/**
 * Minify HTML by removing unnecessary whitespace
 */
export const minifyHtml = (html: string): string => {
  if (!html.trim()) {
    return "";
  }

  return html
    .replace(/\s+/g, " ") // Collapse whitespace
    .replace(/>\s+</g, "><") // Remove whitespace between tags
    .replace(/\s+>/g, ">") // Remove whitespace before >
    .replace(/<\s+/g, "<") // Remove whitespace after <
    .trim();
};

/**
 * Create a safe HTML document for iframe preview
 * This ensures proper light/dark mode support and isolation
 */
export const createPreviewDocument = (
  html: string,
  isDarkMode: boolean
): string => {
  const hasHtmlTag = /<html[^>]*>/i.test(html);
  const hasBodyTag = /<body[^>]*>/i.test(html);
  const hasHeadTag = /<head[^>]*>/i.test(html);

  // If it's a complete document, inject our theme styles
  if (hasHtmlTag && hasBodyTag) {
    const themeClass = isDarkMode ? "dark" : "light";
    const themeStyles = getThemeStyles(isDarkMode);

    // Inject styles into head
    return html
      .replace(/<html([^>]*)>/i, `<html$1 class="${themeClass}">`)
      .replace(
        /<head([^>]*)>/i,
        `<head$1><style id="__preview_theme__">${themeStyles}</style>`
      );
  }

  // Wrap partial HTML in a complete document
  const themeStyles = getThemeStyles(isDarkMode);

  return `<!DOCTYPE html>
<html class="${isDarkMode ? "dark" : "light"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style id="__preview_theme__">${themeStyles}</style>
</head>
<body>
${html}
</body>
</html>`;
};

/**
 * Get CSS styles for light/dark mode
 */
const getThemeStyles = (isDarkMode: boolean): string => {
  if (isDarkMode) {
    return `
      :root {
        color-scheme: dark;
      }
      html, body {
        background-color: #1a1a1a;
        color: #e5e5e5;
      }
      html.dark, html.dark body {
        background-color: #1a1a1a;
        color: #e5e5e5;
      }
      a { color: #60a5fa; }
      img { max-width: 100%; height: auto; }
    `;
  }

  return `
    :root {
      color-scheme: light;
    }
    html, body {
      background-color: #ffffff;
      color: #171717;
    }
    html.light, html.light body {
      background-color: #ffffff;
      color: #171717;
    }
    a { color: #2563eb; }
    img { max-width: 100%; height: auto; }
  `;
};

/**
 * Viewport presets for responsive preview
 */
export type ViewportPreset = "mobile" | "tablet" | "desktop";

export interface ViewportSize {
  width: number;
  height: number;
  label: string;
}

export const viewportPresets: Record<ViewportPreset, ViewportSize> = {
  mobile: { width: 375, height: 667, label: "Mobile (375×667)" },
  tablet: { width: 768, height: 1024, label: "Tablet (768×1024)" },
  desktop: { width: 1280, height: 800, label: "Desktop (1280×800)" },
};

/**
 * Example HTML snippets
 */
export const exampleHtml = {
  basic: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hello World</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a basic HTML page.</p>
</body>
</html>`,

  styled: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Styled Page</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      line-height: 1.6;
    }
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 1rem;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
    }
    .card h1 { margin-bottom: 0.5rem; }
    .card p { opacity: 0.9; }
    .btn {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: white;
      color: #667eea;
      border-radius: 0.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: transform 0.2s;
    }
    .btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome</h1>
    <p>This is a styled card component with CSS.</p>
    <a href="#" class="btn">Learn More</a>
  </div>
</body>
</html>`,

  form: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Form</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      max-width: 500px;
    }
    h2 { margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1rem; }
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
    }
    input, textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 0.5rem;
      font-size: 1rem;
    }
    input:focus, textarea:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    button {
      background: #667eea;
      color: white;
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
    }
    button:hover { background: #5a67d8; }
  </style>
</head>
<body>
  <h2>Contact Us</h2>
  <form onsubmit="event.preventDefault(); alert('Form submitted!');">
    <div class="form-group">
      <label for="name">Name</label>
      <input type="text" id="name" placeholder="Your name">
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="your@email.com">
    </div>
    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" rows="4" placeholder="Your message..."></textarea>
    </div>
    <button type="submit">Send Message</button>
  </form>
</body>
</html>`,

  interactive: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Interactive Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, sans-serif;
      padding: 2rem;
      min-height: 100vh;
    }
    .counter {
      text-align: center;
      padding: 2rem;
    }
    .count {
      font-size: 4rem;
      font-weight: bold;
      color: #667eea;
      margin: 1rem 0;
    }
    .buttons { display: flex; gap: 1rem; justify-content: center; }
    button {
      padding: 0.75rem 1.5rem;
      font-size: 1.25rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: transform 0.1s;
    }
    button:active { transform: scale(0.95); }
    .dec { background: #ef4444; color: white; }
    .inc { background: #22c55e; color: white; }
    .reset { background: #6b7280; color: white; }
  </style>
</head>
<body>
  <div class="counter">
    <h1>Counter</h1>
    <div class="count" id="count">0</div>
    <div class="buttons">
      <button class="dec" onclick="updateCount(-1)">−</button>
      <button class="reset" onclick="resetCount()">Reset</button>
      <button class="inc" onclick="updateCount(1)">+</button>
    </div>
  </div>
  <script>
    let count = 0;
    function updateCount(delta) {
      count += delta;
      document.getElementById('count').textContent = count;
    }
    function resetCount() {
      count = 0;
      document.getElementById('count').textContent = count;
    }
  </script>
</body>
</html>`,
};

export const exampleLabels: Record<keyof typeof exampleHtml, string> = {
  basic: "Basic HTML",
  styled: "Styled Card",
  form: "Contact Form",
  interactive: "Interactive Counter",
};
