import { MONO, esc } from './theme.mjs';

// Sized to the widest row (FRONTEND) plus margin, so the chips fill the canvas
// instead of trailing off into dead space.
const W = 620;
const H = 190;
const ROW_HEIGHT = 32;
const CHIP_HEIGHT = 22;
const LABEL_COLUMN = 118;
const CHAR_WIDTH = 7.4;

export const BAND_GROUPS = [
  { name: 'BACKEND', items: ['php', 'laravel', 'node', 'go', 'rust', 'python'] },
  { name: 'FRONTEND', items: ['typescript', 'javascript', 'react', 'vue', 'next', 'tailwind'] },
  { name: 'DATA', items: ['mysql', 'postgres', 'mongodb', 'redis'] },
  { name: 'INFRA', items: ['docker', 'kubernetes', 'aws', 'azure', 'nginx', 'nix'] },
  { name: 'BENCH', items: ['linux', 'neovim', 'git', 'sdr'] },
];

function chipWidth(item) {
  return Math.round(item.length * CHAR_WIDTH + 20);
}

function renderRow(group, index, theme) {
  const y = 26 + index * ROW_HEIGHT;
  const parts = [
    `<text x="8" y="${y + 15}" font-family="${MONO}" font-size="11" fill="${theme.muted}" letter-spacing="2">${esc(group.name)}</text>`,
    `<line x1="${LABEL_COLUMN - 14}" y1="${y - 4}" x2="${LABEL_COLUMN - 14}" y2="${y + CHIP_HEIGHT + 4}" stroke="${theme.grid}" stroke-width="1"/>`,
  ];

  let x = LABEL_COLUMN;
  for (const item of group.items) {
    const width = chipWidth(item);
    parts.push(
      `<rect x="${x}" y="${y}" width="${width}" height="${CHIP_HEIGHT}" rx="3" fill="${theme.carrier}" fill-opacity="0.10" stroke="${theme.carrier}" stroke-opacity="0.55" stroke-width="1"/>`,
      `<text x="${x + width / 2}" y="${y + 15}" font-family="${MONO}" font-size="11" fill="${theme.text}" text-anchor="middle">${esc(item)}</text>`,
    );
    x += width + 8;
  }
  return parts.join('');
}

export function renderBandPlan(theme) {
  const rows = BAND_GROUPS.map((group, index) => renderRow(group, index, theme)).join('');
  const ticks = [];
  for (let x = LABEL_COLUMN; x <= W - 20; x += 40) {
    ticks.push(`<line x1="${x}" y1="14" x2="${x}" y2="18" stroke="${theme.grid}" stroke-width="1"/>`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Band plan: the tools Anuragh works with, grouped by area">
<line x1="${LABEL_COLUMN}" y1="14" x2="${W - 20}" y2="14" stroke="${theme.grid}" stroke-width="1"/>
${ticks.join('')}
${rows}
</svg>`;
}
