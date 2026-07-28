import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

export function assertWellFormed(svg) {
  execFileSync('xmllint', ['--noout', '-'], { input: svg, stdio: ['pipe', 'ignore', 'pipe'] });
}

// Remove every animation element, leaving the frozen frame-zero document.
export function stripAnimation(svg) {
  return svg
    .replace(/<animate\b[^>]*\/>/g, '')
    .replace(/<animateTransform\b[^>]*\/>/g, '')
    .replace(/<set\b[^>]*\/>/g, '')
    .replace(/<animate\b[\s\S]*?<\/animate>/g, '')
    .replace(/<animateTransform\b[\s\S]*?<\/animateTransform>/g, '');
}

// Assert every listed label survives with all animation removed.
export function assertSurvivesFrozen(svg, labels) {
  const frozen = stripAnimation(svg);
  assertWellFormed(frozen);
  for (const label of labels) {
    assert.ok(frozen.includes(label), `"${label}" must be visible at t=0`);
  }
}

export function coloursIn(svg) {
  return new Set(svg.match(/#[0-9a-f]{6}/g) ?? []);
}

export function allowedColours(theme) {
  return new Set(Object.entries(theme).filter(([k]) => k !== 'name').map(([, v]) => v));
}

export function assertPaletteContained(svg, theme) {
  const allowed = allowedColours(theme);
  for (const colour of coloursIn(svg)) {
    assert.ok(allowed.has(colour), `unexpected colour ${colour} in ${theme.name}`);
  }
}
