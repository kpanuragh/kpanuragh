import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES, MONO, esc } from '../tools/theme.mjs';

test('esc escapes every XML metacharacter', () => {
  assert.equal(esc(`a&b<c>d"e'f`), 'a&amp;b&lt;c&gt;d&quot;e&apos;f');
});

test('esc coerces non-strings', () => {
  assert.equal(esc(42), '42');
});

test('both themes define the same keys', () => {
  assert.deepEqual(Object.keys(THEMES.dark).sort(), Object.keys(THEMES.light).sort());
});

test('every theme colour is a 6-digit hex', () => {
  for (const theme of Object.values(THEMES)) {
    for (const [key, value] of Object.entries(theme)) {
      if (key === 'name') continue;
      assert.match(value, /^#[0-9a-f]{6}$/, `${theme.name}.${key}`);
    }
  }
});

test('font stack needs no XML escaping', () => {
  assert.equal(esc(MONO), MONO);
});
