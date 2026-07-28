import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../tools/theme.mjs';
import { renderWorkshop, WORKSHOP_ROWS } from '../tools/svg-workshop.mjs';
import { renderTerminal, TERMINAL_LINES } from '../tools/svg-terminal.mjs';
import { renderRadar } from '../tools/svg-radar.mjs';
import { assertWellFormed, assertPaletteContained, assertSurvivesFrozen } from './helpers.mjs';

for (const theme of Object.values(THEMES)) {
  test(`workshop (${theme.name}) is well-formed and palette-clean`, () => {
    const svg = renderWorkshop(theme);
    assertWellFormed(svg);
    assertPaletteContained(svg, theme);
  });

  test(`workshop (${theme.name}) shows every pair at t=0`, () => {
    const labels = WORKSHOP_ROWS.flatMap((r) => [r.annoyance, r.tool]);
    assertSurvivesFrozen(renderWorkshop(theme), labels);
  });

  test(`terminal (${theme.name}) is well-formed and palette-clean`, () => {
    const svg = renderTerminal(theme);
    assertWellFormed(svg);
    assertPaletteContained(svg, theme);
  });

  test(`terminal (${theme.name}) is fully typed at t=0`, () => {
    assertSurvivesFrozen(renderTerminal(theme), TERMINAL_LINES.map((l) => l.text));
  });

  test(`terminal (${theme.name}) clip rects start at full width`, () => {
    const svg = renderTerminal(theme);
    for (const values of svg.matchAll(/attributeName="width" values="([^"]*)"/g)) {
      const list = values[1].split(';').map(Number);
      assert.ok(list[0] > 0, 'clip must start open, not closed');
      assert.equal(list[0], list[list.length - 1], 'must return to its starting width');
    }
  });

  test(`radar (${theme.name}) is well-formed and palette-clean`, () => {
    const svg = renderRadar(theme);
    assertWellFormed(svg);
    assertPaletteContained(svg, theme);
  });

  test(`radar (${theme.name}) carries no real aircraft identifiers`, () => {
    const svg = renderRadar(theme);
    assert.ok(!/[A-Z]{2}\d{2,4}\b/.test(svg), 'must not contain flight-number-like strings');
    assert.ok(!/VT-[A-Z]{3}/.test(svg), 'must not contain aircraft registrations');
  });

  test(`workshop, terminal and radar (${theme.name}) are deterministic`, () => {
    assert.equal(renderWorkshop(theme), renderWorkshop(theme));
    assert.equal(renderTerminal(theme), renderTerminal(theme));
    assert.equal(renderRadar(theme), renderRadar(theme));
  });
}
