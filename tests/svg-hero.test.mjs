import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../tools/theme.mjs';
import { renderHero } from '../tools/svg-hero.mjs';
import { assertWellFormed, assertPaletteContained, assertSurvivesFrozen, stripAnimation } from './helpers.mjs';

for (const theme of Object.values(THEMES)) {
  test(`hero (${theme.name}) is well-formed`, () => {
    assertWellFormed(renderHero(theme));
  });

  test(`hero (${theme.name}) uses only its own palette`, () => {
    assertPaletteContained(renderHero(theme), theme);
  });

  test(`hero (${theme.name}) is deterministic`, () => {
    assert.equal(renderHero(theme), renderHero(theme));
  });

  test(`hero (${theme.name}) is complete at t=0`, () => {
    assertSurvivesFrozen(renderHero(theme), [
      'ANURAGH K P', 'anuragh@vatakara', 'RX',
      '>rust<', '>laravel<', '>sdr<', '>local-ai<',
    ]);
  });

  test(`hero (${theme.name}) never claims to transmit`, () => {
    const svg = renderHero(theme);
    assert.ok(!/ON AIR/i.test(svg), 'hero must not say ON AIR — the user is not licensed');
    assert.ok(!/\bVU\d|\bcallsign/i.test(svg), 'hero must not carry a callsign');
  });

  test(`hero (${theme.name}) renders the Morse for the name`, () => {
    const svg = renderHero(theme);
    const bars = svg.match(/class="morse-el"/g) ?? [];
    assert.equal(bars.length, 26, 'expected 26 Morse elements for "ANURAGH K P"');
  });

  test(`hero (${theme.name}) keeps the Morse visible when frozen`, () => {
    const frozen = stripAnimation(renderHero(theme));
    const bars = frozen.match(/class="morse-el"/g) ?? [];
    assert.equal(bars.length, 26, 'Morse must not depend on animation to exist');
  });
}
