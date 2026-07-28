import { MONO, esc } from './theme.mjs';

const W = 640;
const H = 48;
const FONT_SIZE = 16;
const TRACKING = 6;

// Monospace advance is ~0.6em; add tracking to get the drawn width of the label.
function labelWidth(label) {
  return label.length * (FONT_SIZE * 0.6 + TRACKING);
}

export function renderHeader(label, theme) {
  const start = 8 + labelWidth(label) + 18;
  const baseline = 26;
  const burst = [
    `M${start} ${baseline}`,
    'q10 -12 20 0',
    'q10 12 20 0',
    'q10 -16 20 0',
    'q10 10 20 0',
  ].join(' ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}">
<text x="8" y="${baseline + 5}" font-family="${MONO}" font-size="${FONT_SIZE}" font-weight="700" fill="${theme.carrier}" letter-spacing="${TRACKING}">${esc(label)}</text>
<line x1="${start}" y1="${baseline}" x2="${W - 20}" y2="${baseline}" stroke="${theme.grid}" stroke-width="1"/>
<path d="${burst}" fill="none" stroke="${theme.carrier}" stroke-width="1.6" opacity="0.85"/>
<circle cx="${W - 14}" cy="${baseline}" r="3" fill="${theme.peak}"/>
</svg>`;
}
