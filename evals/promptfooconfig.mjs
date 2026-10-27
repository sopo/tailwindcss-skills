import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cases } from './cases.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const model = process.env.CODEX_MODEL || 'gpt-6-sol';
const effort = process.env.CODEX_REASONING_EFFORT || 'medium';

export default {
  description: 'Tailwind CSS skill: paired executable coding-agent evaluations',
  prompts: ['{{request}}'],
  providers: ['baseline', 'skill'].map((condition) => ({
    id: 'openai:codex-sdk',
    label: condition,
    config: {
      model, model_reasoning_effort: effort,
      working_dir: join(root, '.eval', 'fixtures', condition),
      copy_working_dir: 'copy',
      skip_git_repo_check: true,
      sandbox_mode: 'workspace-write', approval_policy: 'never',
      network_access_enabled: false, web_search_mode: 'disabled',
      enable_streaming: true, persist_threads: false,
      cli_env: { CODEX_HOME: join(root, '.eval', 'codex-home') },
    },
  })),
  defaultTest: {
    options: { timeoutMs: 600000 },
    assert: [{ type: 'javascript', value: 'file://./assert-workspace.mjs', metric: 'behavior' }],
  },
  tests: cases.map((item) => ({
    description: item.description,
    vars: { scenario: item.id, request: item.request },
  })),
  evaluateOptions: { maxConcurrency: 2, repeat: 3 },
};
