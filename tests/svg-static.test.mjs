import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { THEMES } from '../tools/theme.mjs';
import { renderHeader } from '../tools/svg-headers.mjs';
import { renderBandPlan, BAND_GROUPS } from '../tools/svg-bandplan.mjs';

function assertWellFormed(svg) {
  execFileSync('xmllint', ['--noout', '-'], { input: svg, stdio: ['pipe', 'ignore', 'pipe'] });
}

function coloursIn(svg) {
  return new Set(svg.match(/#[0-9a-f]{6}/g) ?? []);
}

function allowedColours(theme) {
  return new Set(Object.entries(theme).filter(([k]) => k !== 'name').map(([, v]) => v));
}

for (const theme of Object.values(THEMES)) {
  test(`header (${theme.name}) is well-formed and escaped`, () => {
    const svg = renderHeader('ON AIR', theme);
    assertWellFormed(svg);
    assert.ok(svg.includes('>ON AIR<'));
  });

  test(`header (${theme.name}) escapes hostile labels`, () => {
    const svg = renderHeader('A & <B>', theme);
    assertWellFormed(svg);
    assert.ok(svg.includes('A &amp; &lt;B&gt;'));
  });

  test(`header (${theme.name}) has a transparent background`, () => {
    assert.ok(!renderHeader('ON AIR', theme).includes(theme.ground));
  });

  test(`band plan (${theme.name}) is well-formed`, () => {
    assertWellFormed(renderBandPlan(theme));
  });

  test(`band plan (${theme.name}) uses only its own palette`, () => {
    const allowed = allowedColours(theme);
    for (const colour of coloursIn(renderBandPlan(theme))) {
      assert.ok(allowed.has(colour), `unexpected colour ${colour}`);
    }
  });

  test(`band plan (${theme.name}) lists every item in every group`, () => {
    const svg = renderBandPlan(theme);
    for (const group of BAND_GROUPS) {
      assert.ok(svg.includes(`>${group.name}<`), `missing group ${group.name}`);
      for (const item of group.items) {
        assert.ok(svg.includes(`>${item}<`), `missing item ${item}`);
      }
    }
  });

  test(`band plan (${theme.name}) is deterministic`, () => {
    assert.equal(renderBandPlan(theme), renderBandPlan(theme));
  });
}
