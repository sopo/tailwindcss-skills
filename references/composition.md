# Composition and custom CSS

## Respect component ownership

Prefer existing component variants and documented customization points. Follow the project's composition helper and merge behavior; `cn()`, CVA, or a particular framework is not required by Tailwind.

For a component with an existing destructive variant:

```jsx
// Incorrect when these overrides bypass the established variant/state design.
<Button className="bg-red-700 text-white hover:bg-red-800">Delete</Button>

// Correct for that component API.
<Button variant="destructive">Delete</Button>
```

Extend a reusable appearance through its existing variant/token API when appropriate. Instance classes can express layout and documented customization; inspect the actual API rather than universally prohibiting color or typography classes.

In shadcn projects, reuse semantic roles and theme behavior, preserve the existing `cn()` convention, and let overlays/icons retain the ownership their component API establishes. Outside those conventions, palette utilities, explicit dark variants, custom stacking, and icon sizing remain valid tools.

Extract a component or template partial when it represents stable repeated structure or behavior. A loop already authors its class list once. Local repetition does not automatically justify another abstraction.

## Put CSS in the intended cascade layer

Tailwind establishes `theme`, `base`, `components`, and `utilities`. Element defaults belong in `base`; component CSS in `components` can be overridden by normal utilities.

Incorrect when utility overrides should control the card radius:

```css
.card {
  border-radius: var(--radius-lg);
}
```

Correct:

```css
@layer components {
  .card {
    border-radius: var(--radius-lg);
  }
}
```

For normal declarations at the same origin and importance, unlayered rules outrank layered rules regardless of selector specificity. Important declarations reverse layer precedence. Inspect the cascade before escalating specificity. A targeted utility important modifier ends the class name: `bg-red-700!`.

Register a custom utility with `@utility` when it must work with Tailwind variants:

```css
@utility content-auto {
  content-visibility: auto;
}
```

```html
<div class="lg:content-auto">...</div>
```

A selector merely placed in native `@layer utilities` is not registered as a variant-aware utility. Functional utilities can use `--value()`/`--modifier()` when built-ins and simple custom utilities are insufficient. The later `--default()` helper requires v4.3+; use the baseline APIs unless that newer functionality is needed.

## `@apply` and separately processed stylesheets

`@apply` expands existing utilities in custom CSS. It is useful for CSS-owned or third-party markup; use markup utilities or plain token-based declarations when clearer.

CSS modules and Vue/Svelte/Astro style blocks are processed separately. Reference the application entry when expansion needs its custom theme, utilities, or variants:

Incorrect for an isolated stylesheet that needs application customizations:

```css
.label {
  @apply text-sm text-brand;
}
```

Correct:

```css
@reference "../app.css";

.label {
  @apply text-sm text-brand;
}
```

`@reference` supplies compile-time context without emitting the referenced stylesheet again. `@reference "tailwindcss"` suffices only for the default context. Direct declarations such as `color: var(--color-brand)` need no utility expansion; the global stylesheet must still be loaded so the runtime variable exists.

Keep scoped stylesheet processing purposeful: repeatedly importing the whole Tailwind output duplicates work, whereas reference imports or direct token use preserve the appropriate boundary.

Sources: [utility workflow](https://tailwindcss.com/docs/styling-with-utility-classes), [custom CSS](https://tailwindcss.com/docs/adding-custom-styles), [directives](https://tailwindcss.com/docs/functions-and-directives), [compatibility](https://tailwindcss.com/docs/compatibility), [cascade layers](https://www.w3.org/TR/css-cascade-5/#layer-order), [shadcn styling](https://github.com/shadcn-ui/ui/blob/main/skills/shadcn/rules/styling.md).
