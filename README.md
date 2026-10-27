# Tailwind CSS skill

Reusable guidance for coding agents authoring, reviewing, and debugging UI in existing **Tailwind CSS v4.1+** projects.

The [entry skill](SKILL.md) stays concise and loads [focused references](references/) for utility authoring, themes, source detection, responsive/state behavior, composition, and troubleshooting. It follows the project's existing components and design vocabulary.

## Install

Copy [SKILL.md](SKILL.md) and the entire [references/](references/) directory together into a skill directory named `tailwindcss` in your agent's supported skills location. For a project using `.agents/skills/`, the result is:

```text
.agents/skills/tailwindcss/
  SKILL.md
  references/
```

Install only the skill and references; the evaluation dependencies and research notes are development material. Automatic discovery is enabled by the skill description. You can also explicitly request the `tailwindcss` skill using your agent's invocation syntax.

## Scope and constraints

- Tailwind CSS **v4.1 or later within v4** is the supported baseline. Later-feature requirements are stated beside the relevant reference guidance.
- Browser support follows [Tailwind v4's documented baseline](https://tailwindcss.com/docs/compatibility): Safari 16.4+, Chrome 111+, and Firefox 128+. Individual modern CSS features can require newer browsers.
- Intended for **existing projects**. Fresh Tailwind installation, v3 migration, and dependency upgrades are outside this release's workflow.
- Framework-neutral guidance supports React, Vue, Svelte, Astro, and server-rendered templates. Framework-specific examples explain the processing boundary; this is not a component library.
- Compatibility is an installation constraint. The skill does not repeatedly diagnose older/unknown versions or ask users to reconfirm support.
- Correctness rules are firm; maintainability choices are defaults. Existing conventions take precedence unless they cause a concrete problem.
- shadcn-inspired shorthand, component reuse, and token ownership stay conditional on equivalent behavior and the actual component API. The skill does not require shadcn, `cn()`, CVA, or a semantic token vocabulary.

## Development and evaluation

The development toolchain requires **Node.js 22.22+** and pnpm. Runtime dependencies are for evaluations only; installing the skill does not require them.

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm test:recipes
pnpm eval:prepare
pnpm test
pnpm eval:smoke
pnpm eval
pnpm eval:report
```

See the [evaluation guide](evals/README.md) for model configuration, authentication, fixtures, grading, and result interpretation, and the [measured results](evals/RESULTS.md) for the initial comparison. Agent evaluations use your configured Codex access and consume its usage allowance.

The [research and accepted proposal](research/tailwindcss-v4-best-practices.md) records primary sources and the decisions behind this package.
