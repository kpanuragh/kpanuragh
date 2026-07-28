import { MONO, esc } from './theme.mjs';
import { pulse, wipeAndRetype } from './svg-motion.mjs';

const W = 1000;
const H = 260;
const LEFT = 32;
const TOP = 74;
const LINE_HEIGHT = 30;
const CYCLE = 16;
const CHAR_WIDTH = 8.2;

export const TERMINAL_LINES = [
  { prompt: true, text: 'tui-db --pg' },
  { prompt: false, text: 'connected - 124 cols - vim keys' },
  { prompt: true, text: 'ollama-tui' },
  { prompt: false, text: 'streaming, local, no api key' },
  { prompt: true, text: 'cargo build --release' },
  { prompt: false, text: 'Finished release [optimized]' },
];

const PROMPT = 'anuragh@vatakara ~ $ ';
const CONT = '  > ';

// Returns the clip path and the text separately so the caller can place clip
// paths in <defs> before the body that references them, without regex surgery
// on assembled markup.
function line(entry, index, theme) {
  const y = TOP + index * LINE_HEIGHT;
  const clipId = `type-${index}`;
  const prefix = entry.prompt ? PROMPT : CONT;
  const width = Math.ceil((prefix + entry.text).length * CHAR_WIDTH) + 8;

  // Every line clears together, then they retype in sequence, so the block reads
  // as a session being replayed. Full width at t=0.
  const share = 0.35 / TERMINAL_LINES.length;
  const startAt = 0.6 + index * share;
  const endAt = 0.6 + (index + 1) * share;

  const body = entry.prompt
    ? `<tspan fill="${theme.muted}">${esc(prefix)}</tspan><tspan fill="${theme.text}">${esc(entry.text)}</tspan>`
    : `<tspan fill="${theme.carrier}">${esc(prefix)}</tspan><tspan fill="${theme.muted}">${esc(entry.text)}</tspan>`;

  return {
    clip: `<clipPath id="${clipId}"><rect x="${LEFT}" y="${y - 14}" height="20" width="${width}">`
      + wipeAndRetype({ width, dur: `${CYCLE}s`, holdUntil: 0.5, startAt, endAt })
      + '</rect></clipPath>',
    text: `<text xml:space="preserve" clip-path="url(#${clipId})" x="${LEFT}" y="${y}" font-family="${MONO}" font-size="13">${body}</text>`,
  };
}

export function renderTerminal(theme) {
  const lines = TERMINAL_LINES.map((entry, index) => line(entry, index, theme));
  const cursorY = TOP + TERMINAL_LINES.length * LINE_HEIGHT;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="A terminal session running my own tools: tui-db connecting to Postgres, ollama-tui streaming a local model, and a release build finishing.">
<defs>${lines.map((l) => l.clip).join('')}</defs>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="8" fill="${theme.panel}" stroke="${theme.grid}" stroke-width="1"/>
<circle cx="26" cy="26" r="5" fill="${theme.grid}"/>
<circle cx="44" cy="26" r="5" fill="${theme.grid}"/>
<circle cx="62" cy="26" r="5" fill="${theme.grid}"/>
<text x="${W / 2}" y="30" font-family="${MONO}" font-size="11" fill="${theme.muted}" text-anchor="middle" letter-spacing="2">anuragh@vatakara</text>
<line x1="1" y1="48" x2="${W - 1}" y2="48" stroke="${theme.grid}" stroke-width="1"/>
${lines.map((l) => l.text).join('')}
<text xml:space="preserve" x="${LEFT}" y="${cursorY}" font-family="${MONO}" font-size="13" fill="${theme.muted}">${esc(PROMPT)}</text>
<rect x="${(LEFT + PROMPT.length * CHAR_WIDTH).toFixed(1)}" y="${cursorY - 11}" width="9" height="15" fill="${theme.carrier}">${pulse({ values: '1;0.1;1', dur: '1.2s' })}</rect>
</svg>`;
}
