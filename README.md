<p align="center">
  <img src="assets/tailwindcss-skills-logo-v2.png" alt="Tailwind CSS Skills logo with cyan waves and gold AI sparkles" width="200" />
</p>

# Tailwind CSS skill

[![skills.sh installs](https://skills.sh/b/sopo/tailwindcss-skills)](https://skills.sh/sopo/tailwindcss-skills)

A community-driven Tailwind CSS skill for AI agents.

## Introduction

This project brings Tailwind CSS best practices to AI coding agents, helping them write, review, and fix UI while following your project's existing styles and components. It draws on Tailwind's documentation and ideas from other agent skills.

The skill works with **Tailwind CSS v4.1+** and is framework agnostic, so you can use it in existing React, Vue, Svelte, Astro, and other projects.

## Installation

Run this from the project where you want to use the skill:

```sh
npx skills add sopo/tailwindcss-skills --skill tailwindcss
```

Select your coding agent when prompted. Add `--global` if you want the skill available across projects.

Your agent can discover the skill automatically, or you can ask it to use the `tailwindcss` skill explicitly. You don't need to install this repository's development dependencies to use it.

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
