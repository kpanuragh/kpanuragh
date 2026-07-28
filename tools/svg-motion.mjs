// Shared SMIL primitives.
//
// GitHub renders README SVGs as images: declarative SMIL animates, JavaScript
// does not run. librsvg and any SMIL-less renderer show frozen frame zero, so
// EVERY primitive here is built so that t=0 is the complete, readable state.
// Reveal animations therefore run full -> empty -> full, never empty -> full.

function fixed(value) {
  return Number(value.toFixed(4));
}

// Opacity pulse. t=0 = the first listed value.
export function pulse({ values = '1;0.3;1', dur = '2.4s' } = {}) {
  return `<animate attributeName="opacity" values="${values}" dur="${dur}" repeatCount="indefinite"/>`;
}

// Item `index` of `count` brightens within its slice of a `cycle`-second loop.
// t=0 = rest opacity: dim but always visible, so nothing is hidden at frame zero.
export function staggerBrighten({ index, count, cycle, rest = 0.4, peak = 1 }) {
  const width = 1 / count;
  const start = index * width;
  const crest = Math.min(1, start + width * 0.4);
  const end = Math.min(1, start + width * 0.8);
  const keyTimes = [0, start, crest, end, 1].map(fixed).join(';');
  const values = [rest, rest, peak, rest, rest].join(';');
  return `<animate attributeName="opacity" values="${values}" keyTimes="${keyTimes}" dur="${cycle}s" repeatCount="indefinite"/>`;
}

// Translate 0,0 -> dx,dy on a loop. The caller MUST draw one extra period of
// content beyond the visible area so the wrap-around is invisible.
// t=0 = undisplaced.
export function seamlessTranslate({ dx = 0, dy = 0, dur }) {
  return `<animateTransform attributeName="transform" type="translate" values="0 0;${dx} ${dy}" dur="${dur}" repeatCount="indefinite"/>`;
}

// Clip-rect width: full -> 0 -> full, so the content reads as typed, cleared and
// retyped. t=0 = full width, which is what frozen renderers show.
export function wipeAndRetype({ width, dur, holdUntil = 0.5, startAt = 0.55, endAt = 0.95 }) {
  const wiped = Math.min(startAt, holdUntil + 0.03);
  const keyTimes = [0, holdUntil, wiped, startAt, endAt, 1].map(fixed).join(';');
  const values = [width, width, 0, 0, width, width].join(';');
  return `<animate attributeName="width" values="${values}" keyTimes="${keyTimes}" dur="${dur}" repeatCount="indefinite"/>`;
}
