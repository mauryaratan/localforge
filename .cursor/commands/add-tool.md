# add-tool

This project adds utilities for developers, with specific tools available in the app. LocalForge is a privacy-first PWA where all processing happens client-side.

## Overview

When asked to add a tool:

1. Research similar tools online to identify useful features (without bloating)
2. Plan the feature set keeping performance as the top priority
3. Follow the file structure and patterns documented below
4. Write tests and ensure proper SEO markup

---

## File Structure

Each tool requires the following files:

```
/app/(tools)/[tool-name]/
  ├── layout.tsx        # Metadata & SEO configuration
  └── page.tsx          # Client component with UI and logic
/lib/[tool-name].ts     # Pure utility functions (no React)
/tests/[tool-name].test.ts  # Vitest test file
```

### Naming Conventions

- Route folder: kebab-case (e.g., `url-parser`, `json-formatter`)
- Utility file: matches route name (e.g., `/lib/url-parser.ts`)
- Test file: `[tool-name].test.ts` in `/tests/` directory
- localStorage keys: `devtools:[tool-name]:[field]` (e.g., `devtools:url-parser:input`)

---

## Layout Template (SEO)

Create `layout.tsx` with metadata:

```typescript
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tool Name & Action",
  description: "Clear description mentioning key features and privacy-first processing.",
  keywords: ["keyword1", "keyword2", "localforge", "developer tools"],
  openGraph: {
    title: "Tool Name - LocalForge",
    description: "Brief description of the tool",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tool Name - LocalForge",
    description: "Brief description of the tool",
  },
};

const ToolNameLayout = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export default ToolNameLayout;
```

---

## Page Template

Create `page.tsx` as a client component:

```typescript
"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Copy01Icon, ToolIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getStorageValue, setStorageValue } from "@/lib/utils";

const STORAGE_KEY_INPUT = "devtools:tool-name:input";

const ToolNamePage = () => {
  // State with localStorage initialization
  const [input, setInput] = useState(() => getStorageValue(STORAGE_KEY_INPUT));
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark hydration complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Persist to localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return;
    setStorageValue(STORAGE_KEY_INPUT, input);
  }, [input, isHydrated]);

  // Memoize expensive computations
  const result = useMemo(() => {
    if (!input) return null;
    // Process input here
    return processedResult;
  }, [input]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Main content */}
      <div className="flex max-w-4xl flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-lg">Tool Name</h1>
          <p className="text-muted-foreground text-xs">
            Brief description of what the tool does.
          </p>
        </div>

        {/* Input Card */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-medium text-sm">Input</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter your input..."
              className="min-h-32 font-mono text-sm"
            />
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="font-medium text-sm">Output</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(result)}
              className="cursor-pointer"
              aria-label="Copy output to clipboard"
            >
              <Copy01Icon className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            {/* Output content */}
          </CardContent>
        </Card>
      </div>

      {/* Sticky sidebar for examples */}
      <div className="shrink-0 lg:sticky lg:top-4 lg:h-fit lg:w-72">
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="font-medium text-sm">Examples</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Example inputs users can click to populate */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ToolNamePage;
```

---

## Utility Functions

Create `/lib/[tool-name].ts` for pure logic:

```typescript
export interface ToolResult {
  success: boolean;
  data?: string;
  error?: string;
}

export function validateInput(input: string): { isValid: boolean; error?: string } {
  if (!input.trim()) {
    return { isValid: false, error: "Input is required" };
  }
  return { isValid: true };
}

export function processInput(input: string): ToolResult {
  try {
    // Processing logic here
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Processing failed",
    };
  }
}
```

---

## Tests

Create `/tests/[tool-name].test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { validateInput, processInput } from "@/lib/tool-name";

describe("tool-name", () => {
  describe("validateInput", () => {
    it("should return valid for correct input", () => {
      const result = validateInput("valid input");
      expect(result.isValid).toBe(true);
    });

    it("should return invalid for empty input", () => {
      const result = validateInput("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe("processInput", () => {
    it("should process valid input correctly", () => {
      const result = processInput("test input");
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("should handle edge cases", () => {
      // Test edge cases
    });
  });
});
```

---

## Navigation

Add the tool to `/lib/nav-items.ts`:

```typescript
import { ToolIcon } from "@hugeicons/react";

export const navItems: NavItem[] = [
  // ... existing items
  { title: "Tool Name", href: "/tool-name", icon: ToolIcon },
];
```

Choose an appropriate icon from [Hugeicons](https://hugeicons.com/).

---

## Checklist

### Required

- [ ] Route folder created at `/app/(tools)/[tool-name]/`
- [ ] `layout.tsx` with complete metadata (title, description, keywords, openGraph, twitter)
- [ ] `page.tsx` with "use client" directive
- [ ] Tool added to `/lib/nav-items.ts` with appropriate icon
- [ ] localStorage persistence for main input with hydration handling
- [ ] Tests written in `/tests/[tool-name].test.ts`

### UI/UX

- [ ] Main content + sticky sidebar layout (responsive)
- [ ] `cursor-pointer` class on all clickable elements
- [ ] Copy-to-clipboard functionality with toast feedback
- [ ] Example inputs in sidebar that users can click to populate
- [ ] Consistent max-width (`max-w-4xl`) on main content

### Accessibility

- [ ] `aria-label` on icon-only buttons
- [ ] `aria-pressed` on toggle buttons
- [ ] `aria-expanded` on collapsible sections
- [ ] Proper labels on all form inputs
- [ ] Semantic HTML structure

### Performance

- [ ] `useMemo` for expensive computations
- [ ] Lazy state initialization with functions
- [ ] No heavy data in localStorage (avoid images, large blobs)
- [ ] Avoid unnecessary re-renders

### Code Quality

- [ ] Pure utility functions extracted to `/lib/[tool-name].ts`
- [ ] Reusable components extracted to `/lib` or `/components`
- [ ] TypeScript interfaces for data structures
- [ ] Error handling with try-catch for clipboard, storage, parsing
- [ ] Use `cn()` utility for conditional class names

---

## Component Library

Use existing shadcn/ui components from `/components/ui/`:

- `Button`, `Card`, `Input`, `Textarea`, `Tabs`, `Toggle`, `Badge`, `Select`, `Label`, `Separator`

Install additional components if needed via shadcn CLI.

---

## Styling Conventions

- Use Tailwind CSS utility classes
- `text-muted-foreground` for secondary/helper text
- `border-b` on CardHeader for visual separation
- `font-mono text-sm` for code/data display
- `cn()` function for conditional styles
- Dark mode is handled automatically via `next-themes`

---

## Example: URL Parser Tool

When adding a "URL Parser" tool:

1. Create `/app/(tools)/url-parser/layout.tsx` with SEO metadata
2. Create `/app/(tools)/url-parser/page.tsx` with:
   - Input field for URL
   - Parsed output showing: protocol, hostname, port, pathname, search params, hash
   - Key-value display for URL properties
   - Copy buttons for individual values
   - Example URLs in sidebar
3. Create `/lib/url-parser.ts` with parsing logic
4. Create `/tests/url-parser.test.ts` with test cases
5. Add to `/lib/nav-items.ts` with `Link01Icon`
