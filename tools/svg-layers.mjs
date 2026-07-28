import { MONO, esc } from './theme.mjs';
import { staggerBrighten } from './svg-motion.mjs';

const W = 1000;
const H = 420;
const ROW_HEIGHT = 44;
const TOP = 52;
const RAIL_X = 74;
const CYCLE = 12;

export const LAYERS = [
  { name: 'React / Laravel', project: '', note: 'where most stop' },
  { name: 'Node / PHP runtime', project: '', note: '' },
  { name: 'HTTP / DBGp wire protocol', project: 'xdebug-mcp', note: '' },
  { name: 'DEFLATE / compression', project: 'zlib', note: '' },
  { name: 'Wayland / FreeDesktop spec', project: 'swaynoti', note: '' },
  { name: 'syscalls / terminal', project: 'tui-db', note: '' },
  { name: 'bootloader / Assembly', project: 'myos', note: '' },
  { name: 'silicon', project: '', note: '' },
];

function row(layer, index, theme) {
  const y = TOP + index * ROW_HEIGHT;
  const parts = [
    `<line x1="${RAIL_X + 18}" y1="${y + 22}" x2="${W - 40}" y2="${y + 22}" stroke="${theme.grid}" stroke-width="1"/>`,
    `<circle cx="${RAIL_X}" cy="${y + 22}" r="4" fill="${theme.carrier}"/>`,
    `<text x="${RAIL_X + 30}" y="${y + 26}" font-family="${MONO}" font-size="13" fill="${theme.text}">${esc(layer.name)}</text>`,
  ];

  if (layer.project) {
    const width = layer.project.length * 8 + 22;
    parts.push(
      `<rect x="${W - 40 - width}" y="${y + 8}" width="${width}" height="26" rx="3" fill="${theme.carrier}" fill-opacity="0.12" stroke="${theme.carrier}" stroke-opacity="0.6"/>`,
      `<text x="${W - 40 - width / 2}" y="${y + 26}" font-family="${MONO}" font-size="12" fill="${theme.carrier}" text-anchor="middle">${esc(layer.project)}</text>`,
    );
  }

  if (layer.note) {
    parts.push(
      `<text x="${W - 46}" y="${y + 26}" font-family="${MONO}" font-size="11" fill="${theme.muted}" text-anchor="end" font-style="italic">${esc(layer.note)}</text>`,
    );
  }

  return `<g>${parts.join('')}${staggerBrighten({ index, count: LAYERS.length, cycle: CYCLE, rest: 0.45 })}</g>`;
}

export function renderLayers(theme) {
  const rows = LAYERS.map((layer, index) => row(layer, index, theme)).join('');
  const railTop = TOP + 22;
  const railBottom = TOP + (LAYERS.length - 1) * ROW_HEIGHT + 22;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="The stack from React and Laravel down to silicon, annotated with the project built at each depth: xdebug-mcp at the DBGp wire protocol, zlib at DEFLATE, swaynoti at the Wayland spec, tui-db at syscalls, myos at the bootloader.">
<text x="40" y="30" font-family="${MONO}" font-size="11" fill="${theme.muted}" letter-spacing="3">DEPTH PROBE</text>
<line x1="${RAIL_X}" y1="${railTop}" x2="${RAIL_X}" y2="${railBottom}" stroke="${theme.grid}" stroke-width="2"/>
${rows}
<g>
<polygon points="${RAIL_X - 12},${railTop - 7} ${RAIL_X - 2},${railTop} ${RAIL_X - 12},${railTop + 7}" fill="${theme.peak}"/>
<animateTransform attributeName="transform" type="translate" values="0 0;0 ${railBottom - railTop}" dur="${CYCLE}s" repeatCount="indefinite"/>
</g>
</svg>`;
}
