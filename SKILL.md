---
name: tailwindcss
description: Author, review, and debug Tailwind CSS UI in existing projects. Use for utility styling, theme tokens, responsive layouts, state styling, and missing or conflicting styles. Follows existing component and design-system conventions.
---

# Tailwind CSS

Use the project's existing theme, components, and CSS integration to deliver the requested UI change. Inspect the relevant markup, CSS entry, and nearby conventions before editing; keep that investigation proportional to the task.

## Core decisions

- **Generate detectable classes.** Select complete class strings for finite options. For values supplied at runtime, use an inline style or a CSS custom property referenced by a static utility. Tailwind does not evaluate string interpolation.
- **Use the existing design vocabulary.** Prefer established tokens and component variants. Add a theme token when it represents a reusable design decision; arbitrary values remain useful for one-off needs.
- **Choose one intended style.** Appending a class does not guarantee an override. Resolve conflicting declarations through conditional selection, a supported component option, or the actual CSS cascade.
- **Preserve behavior when simplifying.** Prefer `size-*` for equivalent width/height, `truncate` for equivalent single-line ellipsis, and built-in numeric utilities when they express the intended value. Use `gap-*` for intended flex/grid layouts; preserve intentional margin-based layouts.
- **Keep state meaningful.** Style the existing native, ARIA, or data state. Preserve keyboard focus and non-hover access to essential actions. Follow the application's theme ownership.
- **Keep changes local to the request.** Follow existing composition helpers and component APIs. Extract stable repeated UI concepts when useful; use custom CSS when it expresses the task clearly. Apply authoring preferences to touched code without unrelated cleanup.

## Read the reference that matches the task

| Task | Reference |
| --- | --- |
| Conditional classes, runtime values, arbitrary syntax, shorthand | [Utility authoring](references/utilities.md) |
| Tokens, semantic colors, `@theme inline`/`static`, dark mode | [Themes](references/themes.md) |
| Missing generated classes, shared packages, source boundaries | [Source detection](references/source-detection.md) |
| Viewport/container layouts, focus, disabled state, motion | [Layout and states](references/layout-and-states.md) |
| Component variants, shadcn conventions, cascade layers, `@utility`, `@apply`, scoped styles | [Composition and custom CSS](references/composition.md) |
| Styles are missing, overridden, or resolving unexpectedly | [Troubleshooting](references/troubleshooting.md) |

Read only the relevant references. For a review, report concrete behavioral or convention problems in the requested scope; preserve supported alternatives that already work.

## Verify the changed behavior

Use existing project checks and inspect the affected UI. Match evidence to the change: layout edits need relevant viewport/container checks; source changes need production-output evidence; control changes need keyboard and state checks; theme changes need initial rendering and the affected theme modes. Inspect computed styles when the cascade is uncertain. Report what was checked and any material verification gap.
