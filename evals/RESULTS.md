# Promptfoo evaluation results

Evaluation: eval-S9T-2026-10-27T09:24:43. Requested model: **gpt-6-sol**, reasoning: **medium**.

Complete 36-run comparison: **yes**. Skill-enabled critical checks consistently pass: **yes**. Skill-read evidence in every task area: **yes**.

| Scenario / condition | Passes | Provider errors | Skill reads (heuristic) | Mean provider seconds | Total tokens |
| --- | --- | --- | --- | --- | --- |
| status / baseline | 3/3 | 0 | 0/3 | 38.8 | 371665 |
| status / skill | 3/3 | 0 | 3/3 | 40.4 | 432304 |
| progress / baseline | 3/3 | 0 | 0/3 | 35.7 | 280254 |
| progress / skill | 3/3 | 0 | 3/3 | 45.2 | 406415 |
| theme / baseline | 3/3 | 0 | 0/3 | 26.5 | 270366 |
| theme / skill | 3/3 | 0 | 3/3 | 33.5 | 358341 |
| label / baseline | 3/3 | 0 | 0/3 | 34.1 | 370160 |
| label / skill | 3/3 | 0 | 3/3 | 37.3 | 387306 |
| card / baseline | 3/3 | 0 | 0/3 | 33.0 | 325236 |
| card / skill | 3/3 | 0 | 3/3 | 43.4 | 455422 |
| actions / baseline | 3/3 | 0 | 0/3 | 26.2 | 354084 |
| actions / skill | 3/3 | 0 | 3/3 | 42.4 | 579186 |

Observed passing runs: baseline **18**, skill-enabled **18**.

The conditions tied on task pass count. This comparison does not establish a correctness advantage for the skill on these tasks.

Reported total tokens (including cached input): baseline **1,971,765**, skill-enabled **2,618,974**. Mean provider latency: baseline **32.4s**, skill-enabled **40.4s**. Token totals are usage measurements, not a bill.

Recipe compilation/browser checks: Tailwind 4.1.0: **passed**; Tailwind 4.3.3: **passed**.

Passes require executable artifact checks. Skill reads indicate routing only. Three repetitions are a small local regression sample, not statistical proof of general improvement. Vue/Vite is the executable agent fixture; this does not demonstrate execution coverage of every supported frontend framework or agent runtime.

Toolchain: Node v26.8.2; promptfoo 0.125.1; Codex SDK 0.156.1. Raw JSON: `.eval/results/full.json`; evidence and screenshots remain under `.eval/results/artifacts/` (ignored local output).

See the [evaluation guide](README.md) for assertions, authentication, isolation, environment limits, and reproduction commands.
