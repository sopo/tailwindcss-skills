<p align="center">
  <img src="assets/tailwindcss-skills-logo-v2.png" alt="Tailwind CSS Skills logo with cyan waves and gold AI sparkles" width="200" />
</p>

# Tailwind CSS skill

[![skills.sh installs](https://skills.sh/b/sopo/tailwindcss-skills)](https://skills.sh/sopo/tailwindcss-skills)

A community-driven Tailwind CSS skill for AI agents.

## Introduction

AI models have learned from plenty of Tailwind CSS code and are already good at writing it. A little nudge in the right direction can make them better. That's what this skill is about: helping agents follow Tailwind CSS best practices and work with your project's existing styles and components.

The skill works with **Tailwind CSS v4.1+** and is framework agnostic, so you can use it in existing React, Vue, Svelte, Astro, and other projects.

## Installation

Run this from the project where you want to use the skill:

```sh
npx skills add sopo/tailwindcss-skills --skill tailwindcss
```

## Evaluation

We believe the best evaluation is human judgment. Try the skill in a real project and [file an issue](https://github.com/sopo/tailwindcss-skills/issues) with anything that could be improved. Examples of what you asked for and what the agent produced are especially helpful.

We also use [promptfoo](https://www.promptfoo.dev/) to compare agents working on the same tasks with and without the skill. These evaluations check whether the resulting UI builds and behaves as expected.

See the [evaluation guide](evals/README.md) to run the checks, or read the [measured results](evals/RESULTS.md).

## Development

Contributions are welcome, whether you're improving guidance, adding examples, or reporting a problem.

To work on the repository, use **Node.js 22.22+** and **pnpm**, then install dependencies and run the checks:

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check
pnpm test:recipes
pnpm test
```

The skill lives in [skills/tailwindcss/](skills/tailwindcss/). Start with [SKILL.md](skills/tailwindcss/SKILL.md) for the main guidance and [references/](skills/tailwindcss/references/) for individual topics.

For agent evaluation setup and commands, follow the [evaluation guide](evals/README.md). Agent evaluations use your configured Codex access and consume its usage allowance.

The [research notes](research/tailwindcss-v4-best-practices.md) explain the sources and decisions behind the skill.
