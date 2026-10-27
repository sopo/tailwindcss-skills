export function summarize(rows, scenarios, repeats = 3) {
  const groups = new Map();
  for (const row of rows) {
    const condition = row.provider?.label || 'unknown';
    const scenario = row.testCase?.vars?.scenario || row.vars?.scenario || 'unknown';
    const key = `${scenario}/${condition}`;
    const group = groups.get(key) || { scenario, condition, runs: 0, passes: 0, errors: 0, reads: 0, latencyMs: 0, tokens: 0 };
    group.runs++;
    group.passes += row.success ? 1 : 0;
    group.errors += row.failureReason === 2 ? 1 : 0;
    group.reads += (row.response?.metadata?.skillCalls || []).some((s) => s.name === 'tailwindcss') ? 1 : 0;
    group.latencyMs += row.latencyMs || 0;
    group.tokens += row.tokenUsage?.total || 0;
    groups.set(key, group);
  }
  const expected = scenarios.flatMap((scenario) => ['baseline', 'skill'].map((condition) => `${scenario}/${condition}`));
  const complete = rows.length === expected.length * repeats && expected.every((key) => groups.get(key)?.runs === repeats);
  const skillGroups = scenarios.map((scenario) => groups.get(`${scenario}/skill`));
  const skillPasses = complete && skillGroups.every((group) => group.passes === repeats && group.errors === 0);
  const routingObserved = complete && skillGroups.every((group) => group.reads > 0);
  return { groups: [...groups.values()], complete, skillPasses, routingObserved };
}
