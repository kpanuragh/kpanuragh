import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchStats } from '../tools/fetch-stats.mjs';

function lang(name, size) {
  return { size, node: { name } };
}

function page(nodes, { hasNextPage = false, endCursor = null } = {}) {
  return {
    data: {
      user: {
        followers: { totalCount: 16 },
        contributionsCollection: { contributionCalendar: { totalContributions: 1234 } },
        repositories: {
          totalCount: nodes.length,
          pageInfo: { hasNextPage, endCursor },
          nodes,
        },
      },
    },
  };
}

function stubFetch(pages) {
  let call = 0;
  return async () => {
    const body = pages[call];
    call += 1;
    return { ok: true, status: 200, json: async () => body };
  };
}

test('aggregates stars, repos, followers and contributions', async () => {
  const stats = await fetchStats({
    token: 't',
    login: 'kpanuragh',
    fetchImpl: stubFetch([
      page([
        { name: 'a', stargazerCount: 20, languages: { edges: [lang('Rust', 1000)] } },
        { name: 'b', stargazerCount: 4, languages: { edges: [lang('Go', 500)] } },
      ]),
    ]),
  });

  assert.equal(stats.login, 'kpanuragh');
  assert.equal(stats.repos, 2);
  assert.equal(stats.stars, 24);
  assert.equal(stats.followers, 16);
  assert.equal(stats.contributions, 1234);
});

test('sums language bytes across repos and sorts descending', async () => {
  const stats = await fetchStats({
    token: 't',
    login: 'x',
    fetchImpl: stubFetch([
      page([
        { name: 'a', stargazerCount: 0, languages: { edges: [lang('Rust', 300), lang('Go', 100)] } },
        { name: 'b', stargazerCount: 0, languages: { edges: [lang('Go', 500)] } },
      ]),
    ]),
  });

  assert.deepEqual(stats.languages.map((l) => l.name), ['Go', 'Rust']);
  assert.equal(stats.languages[0].bytes, 600);
  assert.equal(stats.languages[1].bytes, 300);
  assert.ok(Math.abs(stats.languages[0].share - 600 / 900) < 1e-9);
});

test('folds everything past the top eight into "other"', async () => {
  const edges = [];
  for (let i = 0; i < 12; i += 1) {
    edges.push(lang(`L${String(i).padStart(2, '0')}`, 1000 - i * 10));
  }
  const stats = await fetchStats({
    token: 't',
    login: 'x',
    fetchImpl: stubFetch([page([{ name: 'a', stargazerCount: 0, languages: { edges } }])]),
  });

  assert.equal(stats.languages.length, 9);
  assert.equal(stats.languages[8].name, 'other');
  const total = stats.languages.reduce((sum, l) => sum + l.bytes, 0);
  assert.equal(total, edges.reduce((sum, e) => sum + e.size, 0));
});

test('omits "other" when nothing is left over', async () => {
  const stats = await fetchStats({
    token: 't',
    login: 'x',
    fetchImpl: stubFetch([page([{ name: 'a', stargazerCount: 0, languages: { edges: [lang('Rust', 10)] } }])]),
  });
  assert.deepEqual(stats.languages.map((l) => l.name), ['Rust']);
});

test('breaks byte ties by name so output is deterministic', async () => {
  const stats = await fetchStats({
    token: 't',
    login: 'x',
    fetchImpl: stubFetch([
      page([{ name: 'a', stargazerCount: 0, languages: { edges: [lang('Zig', 100), lang('Ada', 100)] } }]),
    ]),
  });
  assert.deepEqual(stats.languages.map((l) => l.name), ['Ada', 'Zig']);
});

test('follows pagination', async () => {
  const stats = await fetchStats({
    token: 't',
    login: 'x',
    fetchImpl: stubFetch([
      page([{ name: 'a', stargazerCount: 5, languages: { edges: [lang('Rust', 10)] } }], {
        hasNextPage: true,
        endCursor: 'CURSOR',
      }),
      page([{ name: 'b', stargazerCount: 7, languages: { edges: [lang('Rust', 10)] } }]),
    ]),
  });
  assert.equal(stats.stars, 12);
});

test('throws on a non-OK response', async () => {
  const failing = async () => ({ ok: false, status: 502, json: async () => ({}) });
  await assert.rejects(
    () => fetchStats({ token: 't', login: 'x', fetchImpl: failing }),
    /502/,
  );
});

test('throws when GraphQL returns errors', async () => {
  const erroring = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ errors: [{ message: 'Bad credentials' }] }),
  });
  await assert.rejects(
    () => fetchStats({ token: 't', login: 'x', fetchImpl: erroring }),
    /Bad credentials/,
  );
});

test('requires a token', async () => {
  await assert.rejects(() => fetchStats({ token: '', login: 'x' }), /token/i);
});
