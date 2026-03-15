# AGENTS.md

## Project

- LocalForge.
- Privacy-first PWA.
- Client-side processing by default.
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Vitest, Biome.
- Package manager: `pnpm`.

## Default posture

- Follow user request exactly.
- Plan first. Short pseudocode ok.
- Then implement fully.
- No TODOs. No placeholders. No half-finished states.
- If unsure, say so. Do not guess.
- Prefer readable code over clever code.
- Keep PWA performance in mind on every change.

## Repo map

```text
app/
  (tools)/[tool-name]/
    layout.tsx
    page.tsx
lib/
tests/
components/ui/
```

## Core rules

- New tools live under `app/(tools)/[tool-name]/`.
- Keep tool logic in `/lib` as pure functions when possible.
- Add tests in `/tests`.
- Add navigation entry in `/lib/nav-items.ts`.
- Reuse existing `components/ui/*` before inventing new primitives.
- Prefer existing helpers like `getStorageValue`, `setStorageValue`, `cn`.
- Tailwind utilities first. Avoid new CSS files or inline styles unless editing shared theme/global styling.
- Use TypeScript types/interfaces for shaped data.

## Coding style

- Early returns.
- `const` arrow functions over function declarations unless framework requires otherwise.
- Descriptive names.
- Event handlers use `handle*` naming.
- Keep code DRY, but not abstract for abstraction's sake.
- Include required imports.
- Ship complete, working code.

## Tool workflow

When adding a tool:

1. Research similar tools. Borrow useful features only. Avoid bloat.
2. Define minimal feature set. Performance first.
3. Create route files:
   - `app/(tools)/[tool-name]/layout.tsx`
   - `app/(tools)/[tool-name]/page.tsx`
4. Create pure utility module in `/lib`.
5. Create Vitest coverage in `/tests/[tool-name].test.ts`.
6. Add tool to `/lib/nav-items.ts`.
7. Verify metadata, accessibility, storage, copy actions, examples, tests.

## Naming

- Route folder: kebab-case.
- Default storage key shape: `devtools:[tool-name]:[field]`.
- Prefer matching route/lib/test names for new standalone tools.
- If extending an existing tool family, follow established local naming instead of forcing a rename.

## `layout.tsx`

- Export complete `Metadata`.
- Include `title`, `description`, `keywords`, `openGraph`, `twitter`.
- Mention privacy-first/client-side processing when true.
- Keep metadata specific. No vague SEO filler.

## `page.tsx`

- Must include `"use client"` for interactive tools.
- Use lazy state init for localStorage-backed inputs.
- Guard storage writes behind hydration.
- Use `useMemo` only for genuinely expensive derived output.
- Prefer responsive main content + sidebar pattern already used in repo.
- Main content usually capped with `max-w-4xl`.
- Add example inputs users can click.
- Add copy-to-clipboard actions with feedback.
- Use semantic structure: heading, supporting text, cards/sections.

## Accessibility

- Label every form control.
- `aria-label` on icon-only buttons.
- `aria-pressed` on toggles when relevant.
- `aria-expanded` on collapsible controls when relevant.
- Keyboard-safe interactions.
- Semantic HTML first.

## Styling

- Tailwind only for component/page styling.
- Use `text-muted-foreground` for helper copy.
- Use `border-b` in `CardHeader` where it matches repo pattern.
- Use `font-mono text-sm` for code/data output.
- Add `cursor-pointer` to clickable non-default affordances where needed.
- Prefer existing spacing/layout rhythm over new one-off patterns.

## Performance

- Client-side only unless tool truly requires otherwise.
- Avoid heavy blobs in localStorage.
- Memoize expensive transforms only.
- Avoid unnecessary re-renders.
- Keep utility functions pure and testable.

## Testing

- Use Vitest.
- Test happy path, empty input, invalid input, edge cases.
- Add regression coverage for bug fixes when practical.
- Prefer testing `/lib` behavior directly.

## Verification

- Run targeted tests first.
- Run `pnpm test` when change scope warrants it.
- Run `pnpm lint` before finishing when code changed.
- Use `pnpm build` for route/metadata/Next.js changes when feasible.
- Note that `pnpm lint` uses Biome with `--write`; inspect resulting diff.

## Existing patterns

- Nav icons come from `@hugeicons/core-free-icons`.
- UI primitives live in `components/ui/`.
- Tool routes already follow a shared card-based pattern; match it unless the tool needs a different layout.
- Keep logic out of React components when it can live in `/lib`.
