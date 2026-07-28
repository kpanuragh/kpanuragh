import { MONO, esc } from './theme.mjs';

const SIZE = 320;
const CENTRE = SIZE / 2;
const RADIUS = 130;
const SWEEP_SECONDS = 6;

// Generic contacts. Deliberately unlabelled: showing a radar animation is fine,
// publishing captured traffic with real registrations is a different thing.
const CONTACTS = [
  { angle: 35, distance: 0.55 },
  { angle: 92, distance: 0.8 },
  { angle: 158, distance: 0.35 },
  { angle: 231, distance: 0.68 },
  { angle: 300, distance: 0.47 },
];

function polar(angle, distance) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: CENTRE + Math.cos(radians) * RADIUS * distance,
    y: CENTRE + Math.sin(radians) * RADIUS * distance,
  };
}

function contact(spot, theme) {
  const { x, y } = polar(spot.angle, spot.distance);
  // Brighten as the sweep passes this bearing.
  const begin = ((spot.angle / 360) * SWEEP_SECONDS).toFixed(2);
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${theme.peak}" opacity="0.35">`
    + `<animate attributeName="opacity" values="0.35;1;0.35" keyTimes="0;0.08;1" dur="${SWEEP_SECONDS}s" begin="${begin}s" repeatCount="indefinite"/>`
    + '</circle>';
}

export function renderRadar(theme) {
  const rings = [0.33, 0.66, 1]
    .map((r) => `<circle cx="${CENTRE}" cy="${CENTRE}" r="${(RADIUS * r).toFixed(1)}" fill="none" stroke="${theme.grid}" stroke-width="1"/>`)
    .join('');

  const contacts = CONTACTS.map((spot) => contact(spot, theme)).join('');
  const wedge = polar(30, 1);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="A radar sweep with contacts appearing as the beam passes — a nod to decoding aircraft transponders with a software-defined radio. Receive only.">
<defs>
<radialGradient id="sweep-fade">
<stop offset="0" stop-color="${theme.carrier}" stop-opacity="0.45"/>
<stop offset="1" stop-color="${theme.carrier}" stop-opacity="0"/>
</radialGradient>
</defs>
<circle cx="${CENTRE}" cy="${CENTRE}" r="${RADIUS}" fill="${theme.panel}" stroke="${theme.grid}" stroke-width="1"/>
${rings}
<line x1="${CENTRE - RADIUS}" y1="${CENTRE}" x2="${CENTRE + RADIUS}" y2="${CENTRE}" stroke="${theme.grid}" stroke-width="1"/>
<line x1="${CENTRE}" y1="${CENTRE - RADIUS}" x2="${CENTRE}" y2="${CENTRE + RADIUS}" stroke="${theme.grid}" stroke-width="1"/>
${contacts}
<g>
<path d="M${CENTRE} ${CENTRE} L${CENTRE} ${CENTRE - RADIUS} A${RADIUS} ${RADIUS} 0 0 1 ${wedge.x.toFixed(1)} ${wedge.y.toFixed(1)} Z" fill="url(#sweep-fade)"/>
<line x1="${CENTRE}" y1="${CENTRE}" x2="${CENTRE}" y2="${CENTRE - RADIUS}" stroke="${theme.carrier}" stroke-width="1.5"/>
<animateTransform attributeName="transform" type="rotate" values="0 ${CENTRE} ${CENTRE};360 ${CENTRE} ${CENTRE}" dur="${SWEEP_SECONDS}s" repeatCount="indefinite"/>
</g>
<text x="${CENTRE}" y="${SIZE - 8}" font-family="${MONO}" font-size="10" fill="${theme.muted}" text-anchor="middle" letter-spacing="2">${esc('RECEIVE ONLY')}</text>
</svg>`;
}
