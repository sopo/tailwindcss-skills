import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../summarize.mjs';

const row = (condition, overrides = {}) => ({
  provider: { label: condition }, testCase: { vars: { scenario: 'status' } },
  success: true, failureReason: 0,
  response: { metadata: { skillCalls: condition === 'skill' ? [{ name: 'tailwindcss' }] : [] } },
  ...overrides,
});

test('a passing smoke test does not establish complete evaluation readiness', () => {
  const result = summarize([row('baseline'), row('skill')], ['status']);
  assert.equal(result.complete, false);
  assert.equal(result.skillPasses, false);
});

test('behavioral failures and provider errors are distinguished', () => {
  const result = summarize([
    row('baseline', { success: false, failureReason: 1, error: 'Wrong rendered color' }),
    row('skill', { success: false, failureReason: 2, error: 'Authentication failed' }),
  ], ['status'], 1);
  assert.equal(result.groups[0].errors, 0);
  assert.equal(result.groups[1].errors, 1);
  assert.equal(result.skillPasses, false);
});

test('successful task output without skill routing evidence is reported separately', () => {
  const result = summarize([row('baseline'), row('skill', { response: { metadata: {} } })], ['status'], 1);
  assert.equal(result.skillPasses, true);
  assert.equal(result.routingObserved, false);
});
