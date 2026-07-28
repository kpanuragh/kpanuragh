import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generate } from '../tools/generate-stats.mjs';

function okFetch() {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      data: {
        user: {
          followers: { totalCount: 16 },
          contributionsCollection: { contributionCalendar: { totalContributions: 999 } },
          repositories: {
            totalCount: 1,
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [
              { name: 'a', stargazerCount: 20, languages: { edges: [{ size: 100, node: { name: 'Rust' } }] } },
            ],
          },
        },
      },
    }),
  });
}

test('writes four SVGs', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'stats-'));
  const written = await generate({ token: 't', login: 'x', outDir: dir, fetchImpl: okFetch() });
  assert.equal(written.length, 4);
  assert.deepEqual(readdirSync(dir).sort(), [
    'spectrum-dark.svg',
    'spectrum-light.svg',
    'stats-dark.svg',
    'stats-light.svg',
  ]);
});

test('output is deterministic across runs', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'stats-'));
  await generate({ token: 't', login: 'x', outDir: dir, fetchImpl: okFetch() });
  const first = readFileSync(join(dir, 'stats-dark.svg'), 'utf8');
  await generate({ token: 't', login: 'x', outDir: dir, fetchImpl: okFetch() });
  const second = readFileSync(join(dir, 'stats-dark.svg'), 'utf8');
  assert.equal(first, second);
});

test('writes nothing when the API fails, leaving existing assets intact', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'stats-'));
  writeFileSync(join(dir, 'stats-dark.svg'), 'SENTINEL', 'utf8');
  const failing = async () => ({ ok: false, status: 500, json: async () => ({}) });

  await assert.rejects(() => generate({ token: 't', login: 'x', outDir: dir, fetchImpl: failing }), /500/);

  assert.equal(readFileSync(join(dir, 'stats-dark.svg'), 'utf8'), 'SENTINEL');
  assert.deepEqual(readdirSync(dir), ['stats-dark.svg']);
});
