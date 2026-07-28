import { MONO, esc } from './theme.mjs';

const W = 1000;
const H = 300;
const BASELINE = 232;

const PEAKS = [
  { x: 190, height: 46, width: 26, label: 'rust' },
  { x: 415, height: 34, width: 22, label: 'laravel' },
  { x: 640, height: 52, width: 20, label: 'sdr' },
  { x: 845, height: 28, width: 24, label: 'local-ai' },
];

// Deterministic LCG. Math.random would break byte-identical rebuilds.
function rng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function envelope(x) {
  let lift = 0;
  for (const peak of PEAKS) {
    const d = (x - peak.x) / peak.width;
    lift += peak.height * Math.exp(-d * d);
  }
  return lift;
}

function tracePath() {
  const random = rng(20260728);
  const points = [];
  for (let x = 40; x <= 960; x += 4) {
    const y = BASELINE - envelope(x) - random() * 5;
    points.push(`${x},${y.toFixed(1)}`);
  }
  return `M${points.join(' L')}`;
}

function waterfall(theme) {
  const cells = [];
  const cellW = 19;
  for (let row = 0; row < 2; row += 1) {
    const y = 262 + row * 16;
    const decay = 1 - row * 0.45;
    for (let i = 0; i < 48; i += 1) {
      const x = 40 + i * cellW;
      const strength = Math.min(1, envelope(x + cellW / 2) / 52);
      const opacity = (0.08 + strength * 0.62) * decay;
      cells.push(
        `<rect x="${x}" y="${y}" width="${cellW - 3}" height="12" fill="${theme.carrier}" opacity="${opacity.toFixed(3)}"/>`,
      );
    }
  }
  return cells.join('');
}

function gridLines(theme) {
  const lines = [];
  for (let x = 40; x <= 960; x += 46) {
    lines.push(
      `<line x1="${x}" y1="178" x2="${x}" y2="${BASELINE}" stroke="${theme.grid}" stroke-width="1" opacity="0.55"/>`,
    );
  }
  return lines.join('');
}

function peakMarkers(theme) {
  return PEAKS.map((peak) => {
    const y = BASELINE - envelope(peak.x);
    return [
      `<circle cx="${peak.x}" cy="${y.toFixed(1)}" r="3.5" fill="${theme.peak}"/>`,
      `<line x1="${peak.x}" y1="${(y + 6).toFixed(1)}" x2="${peak.x}" y2="242" stroke="${theme.peak}" stroke-width="1" opacity="0.5"/>`,
      `<text x="${peak.x}" y="252" font-family="${MONO}" font-size="11" fill="${theme.muted}" text-anchor="middle">${esc(peak.label)}</text>`,
    ].join('');
  }).join('');
}

export function renderHero(theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Anuragh K P, full stack developer">
<rect width="${W}" height="${H}" fill="${theme.ground}"/>
<text x="40" y="26" font-family="${MONO}" font-size="12" fill="${theme.muted}" letter-spacing="1.5">anuragh@vatakara</text>
<g>
<circle cx="908" cy="22" r="4" fill="${theme.peak}"><animate attributeName="opacity" values="1;0.25;1" dur="2.4s" repeatCount="indefinite"/></circle>
<text x="922" y="26" font-family="${MONO}" font-size="12" fill="${theme.peak}" letter-spacing="2">ON AIR</text>
</g>
<line x1="40" y1="38" x2="960" y2="38" stroke="${theme.grid}" stroke-width="1"/>
<text x="40" y="112" font-family="${MONO}" font-size="52" font-weight="700" fill="${theme.text}" letter-spacing="14">ANURAGH K P</text>
<text x="43" y="146" font-family="${MONO}" font-size="15" fill="${theme.muted}" letter-spacing="2.5">full stack developer &#183; rust &#183; laravel &#183; sdr</text>
${gridLines(theme)}
<line x1="40" y1="${BASELINE}" x2="960" y2="${BASELINE}" stroke="${theme.grid}" stroke-width="1"/>
<path d="${tracePath()}" fill="none" stroke="${theme.carrier}" stroke-width="6" opacity="0.18" stroke-linejoin="round"/>
<path d="${tracePath()}" fill="none" stroke="${theme.carrier}" stroke-width="1.8" stroke-linejoin="round"/>
${peakMarkers(theme)}
${waterfall(theme)}
<g opacity="0.45">
<line x1="40" y1="170" x2="40" y2="296" stroke="${theme.carrier}" stroke-width="1.5">
<animate attributeName="x1" values="40;960;40" dur="9s" repeatCount="indefinite"/>
<animate attributeName="x2" values="40;960;40" dur="9s" repeatCount="indefinite"/>
</line>
</g>
</svg>`;
}
