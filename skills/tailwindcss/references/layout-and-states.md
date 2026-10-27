# Layout and state behavior

## Viewport versus available component space

Unprefixed utilities are the base at all sizes. A minimum-width variant applies at its breakpoint and above; `sm:` does not mean the narrowest screens.

Incorrect for centered text on narrow screens:

```html
<p class="sm:text-center">...</p>
```

Correct:

```html
<p class="text-center sm:text-left">...</p>
```

Choose viewport variants for page-level changes and container queries when a component adapts to its slot. Establish a query container on an ancestor:

```html
<section class="@container/card">
  <article class="flex flex-col gap-4 @md/card:flex-row">...</article>
</section>
```

The element is not its own queried container. Named containers identify the relevant ancestor in nested layouts. Container and viewport scales differ: default `@md` is `28rem`, whereas viewport `md` is `48rem`. Respect project overrides; keep custom breakpoint units consistent. Range variants such as `md:max-xl:*` can target a bounded viewport range.

Check the narrowest intended width, relevant breakpoint edges, and actual container slots. Preserve wrapping and overflow behavior when changing layout or replacing `space-*` with `gap-*`.

## Style existing semantic state

Use native variants (`disabled:`, `checked:`, `invalid:`), existing ARIA/data attributes, parent `group-*`, previous-sibling `peer-*`, and relational `has-*` according to the component's actual state model. A `peer` marker must precede the element it affects.

```html
<button
  type="button"
  aria-expanded="false"
  class="rounded-md bg-blue-700 px-4 py-2 text-white enabled:hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50 motion-safe:transition-colors"
>
  Show details
</button>
```

The application still implements disclosure behavior and updates `aria-expanded`. CSS matching an ARIA/data attribute does not supply keyboard interaction or semantics. A disabled appearance alone does not disable a control.

## Preserve accessible interaction

- Keep a visible keyboard focus indicator, using the native one or an intentional replacement. `outline-hidden` preserves an invisible forced-color outline; `outline-none` removes outline styling.
- Essential actions must work without hover. Tailwind's `hover:` uses `(hover: hover)` and is an enhancement on capable input devices.
- Use `motion-safe:` for nonessential motion or `motion-reduce:` to simplify the affected behavior.
- Inspect actual contrast in affected themes; a color utility is not a contrast guarantee.
- When replacing native control appearance, check forced colors and use an appropriate native fallback such as `forced-colors:appearance-auto` when needed.
- Preserve semantic headings/lists despite Preflight's visual resets. Intentionally unstyled lists can require `role="list"` for VoiceOver announcement.

Sources: [responsive design](https://tailwindcss.com/docs/responsive-design), [states](https://tailwindcss.com/docs/hover-focus-and-other-states), [Preflight](https://tailwindcss.com/docs/preflight), [WCAG Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).
