import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { THEMES } from '../tools/theme.mjs';
import { renderHero } from '../tools/svg-hero.mjs';

function assertWellFormed(svg, label) {
  execFileSync('xmllint', ['--noout', '-'], { input: svg, stdio: ['pipe', 'ignore', 'pipe'] });
  assert.ok(svg.startsWith('<svg'), `${label} starts with <svg`);
}

function coloursIn(svg) {
  return new Set(svg.match(/#[0-9a-f]{6}/g) ?? []);
}

for (const theme of Object.values(THEMES)) {
  test(`hero (${theme.name}) is well-formed XML`, () => {
    assertWellFormed(renderHero(theme), theme.name);
  });

  test(`hero (${theme.name}) uses only its own palette`, () => {
    const allowed = new Set(Object.entries(theme).filter(([k]) => k !== 'name').map(([, v]) => v));
    for (const colour of coloursIn(renderHero(theme))) {
      assert.ok(allowed.has(colour), `unexpected colour ${colour} in ${theme.name} hero`);
    }
  });

  test(`hero (${theme.name}) is deterministic`, () => {
    assert.equal(renderHero(theme), renderHero(theme));
  });

  test(`hero (${theme.name}) carries the name and all four peak labels`, () => {
    const svg = renderHero(theme);
    assert.match(svg, /ANURAGH K P/);
    for (const label of ['rust', 'laravel', 'sdr', 'local-ai']) {
      assert.ok(svg.includes(`>${label}<`), `missing peak label ${label}`);
    }
  });
}

test('hero renders content outside animation elements', () => {
  const withoutAnimation = renderHero(THEMES.dark).replace(/<animate[^>]*\/>/g, '');
  assert.match(withoutAnimation, /ANURAGH K P/);
  assert.ok(withoutAnimation.includes('>rust<'));
});
