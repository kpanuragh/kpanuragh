import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { THEMES, esc } from '../tools/theme.mjs';
import { renderStats, renderSpectrum } from '../tools/svg-stats.mjs';

const STATS = {
  login: 'kpanuragh',
  repos: 49,
  stars: 55,
  followers: 16,
  contributions: 1234,
  languages: [
    { name: 'Rust', bytes: 900, share: 0.45 },
    { name: 'TypeScript', bytes: 400, share: 0.2 },
    { name: 'C++', bytes: 300, share: 0.15 },
    { name: 'other', bytes: 400, share: 0.2 },
  ],
};

function assertWellFormed(svg) {
  execFileSync('xmllint', ['--noout', '-'], { input: svg, stdio: ['pipe', 'ignore', 'pipe'] });
}

for (const theme of Object.values(THEMES)) {
  test(`stats (${theme.name}) is well-formed`, () => {
    assertWellFormed(renderStats(STATS, theme));
  });

  test(`spectrum (${theme.name}) is well-formed`, () => {
    assertWellFormed(renderSpectrum(STATS.languages, theme));
  });

  test(`stats (${theme.name}) shows every figure`, () => {
    const svg = renderStats(STATS, theme);
    for (const value of ['49', '55', '16', '1,234']) {
      assert.ok(svg.includes(`>${value}<`), `missing value ${value}`);
    }
  });

  test(`spectrum (${theme.name}) labels every language`, () => {
    const svg = renderSpectrum(STATS.languages, theme);
    for (const language of STATS.languages) {
      assert.ok(svg.includes(esc(language.name)), `missing language ${language.name}`);
    }
  });

  test(`stats and spectrum (${theme.name}) are deterministic`, () => {
    assert.equal(renderStats(STATS, theme), renderStats(STATS, theme));
    assert.equal(renderSpectrum(STATS.languages, theme), renderSpectrum(STATS.languages, theme));
  });

  test(`spectrum (${theme.name}) escapes language names containing XML characters`, () => {
    const svg = renderSpectrum([{ name: 'C++ & <script>', bytes: 1, share: 1 }], theme);
    assertWellFormed(svg);
    assert.ok(!svg.includes('<script>'));
  });

  test(`spectrum (${theme.name}) survives an empty language list`, () => {
    assertWellFormed(renderSpectrum([], theme));
  });
}
