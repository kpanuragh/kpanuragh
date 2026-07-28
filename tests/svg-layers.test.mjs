import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THEMES } from '../tools/theme.mjs';
import { renderLayers, LAYERS } from '../tools/svg-layers.mjs';
import { assertWellFormed, assertPaletteContained, assertSurvivesFrozen } from './helpers.mjs';

for (const theme of Object.values(THEMES)) {
  test(`layers (${theme.name}) is well-formed`, () => {
    assertWellFormed(renderLayers(theme));
  });

  test(`layers (${theme.name}) uses only its own palette`, () => {
    assertPaletteContained(renderLayers(theme), theme);
  });

  test(`layers (${theme.name}) is deterministic`, () => {
    assert.equal(renderLayers(theme), renderLayers(theme));
  });

  test(`layers (${theme.name}) shows every layer and project at t=0`, () => {
    const labels = LAYERS.flatMap((l) => [l.name, l.project].filter(Boolean));
    assertSurvivesFrozen(renderLayers(theme), labels);
  });

  test(`layers (${theme.name}) names the projects that carry the claim`, () => {
    const svg = renderLayers(theme);
    for (const project of ['xdebug-mcp', 'zlib', 'swaynoti', 'tui-db', 'myos']) {
      assert.ok(svg.includes(project), `missing ${project}`);
    }
  });
}

test('layers are ordered from abstraction down to silicon', () => {
  assert.equal(LAYERS[0].name, 'React / Laravel');
  assert.equal(LAYERS[LAYERS.length - 1].name, 'silicon');
});
