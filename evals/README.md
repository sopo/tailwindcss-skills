# Evaluating the skill

Promptfoo runs the same six gallery tasks with and without an installed `tailwindcss` skill. The initial runtime is its built-in Codex SDK provider; the model defaults to `gpt-6-sol` and can be changed with `CODEX_MODEL`. Set `CODEX_REASONING_EFFORT` to choose reasoning effort (default `medium`). Record both when comparing runs.

## Run

Install the repository's pinned dependencies and Chromium as described in the [root README](../README.md). Then:

```sh
pnpm eval:prepare
pnpm test
pnpm eval:validate
pnpm eval:smoke
pnpm eval
pnpm eval:report
```

`eval:smoke` runs the first case once in each condition. `eval` runs all six cases three times per condition: **36 agent runs**. Concurrency is two. The full run starts fresh rather than counting the smoke test toward its repetitions.

The runner defaults to the existing Codex login and removes ambient API-key variables from its child process so they cannot silently override that login. For intentional API-key runs, set `CODEX_AUTH_MODE=api` with `OPENAI_API_KEY` or `CODEX_API_KEY`. Preparation creates an ignored, isolated Codex home and links the existing login file rather than copying it into distributable files. `CODEX_LOGIN_HOME` can identify a nondefault login directory. Personal Codex plugins/configuration are not copied. Any independently discovered home-level `.agents` skills remain an environmental limitation and must be considered when interpreting the baseline.

For another model:

```sh
CODEX_MODEL=your-model-id pnpm eval
```

The Codex SDK is pinned to `0.156.1` because the installed promptfoo provider requires the `^0.156.1` compatibility range. This is an evaluation dependency, not a requirement on users installing the skill.

## What is measured

| Task | Executable evidence |
| --- | --- |
| Local/shared status styling | Production-built local tone updates and shared-package background |
| Runtime values | Multiple unseen fractional percentages and hex colors rendered through controls |
| Nested theme aliases | Separate light/dark role resolution and a local theme toggle |
| Scoped caption CSS | Successful build, brand color, semibold weight, preserved global theme |
| Responsive cards | Different slot widths at one viewport, resized slots, gap, keyboard focus |
| Component variant | Existing destructive variant, two themes, keyboard activation, disabled behavior |

Scope checks reject changes outside the requested gallery module. Original fixtures contain no grader, repair oracle, expected answer, or evaluation instructions. Authoritative assertions run outside the agent-editable copy. Checker tests first reject the broken starting states, accept known repairs, and reject unrelated edits.

Promptfoo creates a fresh project copy per run. Both conditions have identical model/settings, tools, permissions, tasks, and source files; only one includes the skill and references. Network and web search are disabled for the agent. Dependencies are preinstalled from the committed fixture lockfile so the task does not depend on package downloads or a changing transitive dependency graph.

The workspace assertion builds the edited project and drives Chromium against its production output. It saves changed files, generated CSS, screenshots, build/check logs, final response, and inferred skill reads under `.eval/results/artifacts/` before promptfoo removes the workspace. A skill-file read is a **heuristic routing signal**, not proof of improvement, and does not substitute for behavior checks.

`test:recipes` separately compiles examples drawn from the reference documents using Tailwind **4.1.0** and **4.3.3**, then checks selected browser behavior. It does not claim to test every snippet or every supported frontend framework. Vue/Vite is the initial executable agent fixture; other framework syntax remains documentation until separately validated.

## Readiness and limits

Critical executable checks must pass consistently in the skill-enabled runs. Compare each condition's repeated outcomes and inspect failures before changing instructions. Ties are valid results; three repetitions are a small local regression sample, not statistical proof of improvement. Model output prose never serves as evidence that a build or UI check passed.

The summary distinguishes behavioral failures from provider errors; checker diagnostics are retained with the artifacts. Raw promptfoo JSON and all artifacts are ignored development output. `pnpm eval:report --save` also updates the [measured package results](RESULTS.md), and refuses to save an incomplete comparison as the package result. Never replace an unrun or failed evaluation with a claimed pass.

Sources: [promptfoo skill evaluations](https://www.promptfoo.dev/docs/guides/test-agent-skills/), [coding-agent isolation](https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/), [Codex provider](https://www.promptfoo.dev/docs/providers/openai-codex-sdk/), [JavaScript assertions](https://www.promptfoo.dev/docs/configuration/expected-outputs/javascript/).
