import { MONO, esc } from './theme.mjs';
import { staggerBrighten } from './svg-motion.mjs';

const W = 1000;
const H = 250;
const TOP = 46;
const ROW_HEIGHT = 32;
const CYCLE = 14;
const SPLIT = 470;

export const WORKSHOP_ROWS = [
  { annoyance: 'notifications looked wrong', tool: 'swaynoti' },
  { annoyance: 'no launcher I liked', tool: 'wlaunch-rs' },
  { annoyance: 'DBeaver is too heavy', tool: 'tui-db' },
  { annoyance: 'an AI could not debug PHP', tool: 'xdebug-mcp' },
  { annoyance: 'zlib needed native bindings', tool: 'zlib' },
  { annoyance: 'what is under the OS?', tool: 'myos' },
];

function row(entry, index, theme) {
  const y = TOP + index * ROW_HEIGHT;
  const width = entry.tool.length * 8 + 22;
  return '<g>'
    + `<text x="${SPLIT - 40}" y="${y + 16}" font-family="${MONO}" font-size="12" fill="${theme.muted}" text-anchor="end">${esc(entry.annoyance)}</text>`
    + `<line x1="${SPLIT - 30}" y1="${y + 12}" x2="${SPLIT + 6}" y2="${y + 12}" stroke="${theme.grid}" stroke-width="1"/>`
    + `<polygon points="${SPLIT + 6},${y + 8} ${SPLIT + 14},${y + 12} ${SPLIT + 6},${y + 16}" fill="${theme.peak}"/>`
    + `<rect x="${SPLIT + 26}" y="${y}" width="${width}" height="24" rx="3" fill="${theme.carrier}" fill-opacity="0.12" stroke="${theme.carrier}" stroke-opacity="0.6"/>`
    + `<text x="${SPLIT + 26 + width / 2}" y="${y + 16}" font-family="${MONO}" font-size="12" fill="${theme.carrier}" text-anchor="middle">${esc(entry.tool)}</text>`
    + staggerBrighten({ index, count: WORKSHOP_ROWS.length, cycle: CYCLE, rest: 0.5 })
    + '</g>';
}

export function renderWorkshop(theme) {
  const rows = WORKSHOP_ROWS.map((entry, index) => row(entry, index, theme)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Each irritation and the tool written to remove it: notifications to swaynoti, launcher to wlaunch-rs, database client to tui-db, PHP debugging to xdebug-mcp, compression to zlib, and curiosity about the operating system to myos.">
<text x="40" y="26" font-family="${MONO}" font-size="11" fill="${theme.muted}" letter-spacing="3">ANNOYANCE</text>
<text x="${SPLIT + 26}" y="26" font-family="${MONO}" font-size="11" fill="${theme.muted}" letter-spacing="3">WHAT I BUILT</text>
${rows}
</svg>`;
}
