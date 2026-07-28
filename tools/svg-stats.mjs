import { MONO, esc } from './theme.mjs';

const W = 520;
const H = 220;

function panel(theme, title) {
  return `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="6" fill="${theme.panel}" stroke="${theme.grid}" stroke-width="1"/>
<text x="20" y="30" font-family="${MONO}" font-size="11" fill="${theme.carrier}" letter-spacing="3">${esc(title)}</text>
<line x1="20" y1="42" x2="${W - 20}" y2="42" stroke="${theme.grid}" stroke-width="1"/>`;
}

function group(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function renderStats(stats, theme) {
  const rows = [
    ['PUBLIC REPOS', stats.repos],
    ['TOTAL STARS', stats.stars],
    ['FOLLOWERS', stats.followers],
    ['CONTRIBUTIONS / 365d', stats.contributions],
  ];

  const body = rows
    .map(([label, value], index) => {
      const y = 76 + index * 34;
      return `<text x="20" y="${y}" font-family="${MONO}" font-size="12" fill="${theme.muted}" letter-spacing="1">${esc(label)}</text>
<text x="${W - 20}" y="${y}" font-family="${MONO}" font-size="20" font-weight="700" fill="${theme.text}" text-anchor="end">${esc(group(value))}</text>
<line x1="20" y1="${y + 10}" x2="${W - 20}" y2="${y + 10}" stroke="${theme.grid}" stroke-width="1" opacity="0.6"/>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="GitHub statistics for ${esc(stats.login)}: ${esc(group(stats.repos))} public repositories, ${esc(group(stats.stars))} stars, ${esc(group(stats.followers))} followers, ${esc(group(stats.contributions))} contributions in the last year">
${panel(theme, 'STATION LOG')}
${body}
</svg>`;
}

export function renderSpectrum(languages, theme) {
  const axisY = 168;
  const maxBarHeight = 104;
  const left = 24;
  const right = W - 24;
  const slot = languages.length > 0 ? (right - left) / languages.length : 0;
  const barWidth = Math.max(6, Math.min(34, slot - 10));
  const maxShare = languages.reduce((max, l) => Math.max(max, l.share), 0);

  const bars = languages
    .map((language, index) => {
      const centre = left + slot * (index + 0.5);
      const x = centre - barWidth / 2;
      const height = maxShare === 0 ? 2 : Math.max(2, (language.share / maxShare) * maxBarHeight);
      const y = axisY - height;
      const percent = `${(language.share * 100).toFixed(1)}%`;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" fill="${theme.carrier}" fill-opacity="0.7"/>
<rect x="${x.toFixed(1)}" y="${(y - 3).toFixed(1)}" width="${barWidth.toFixed(1)}" height="3" fill="${theme.peak}"/>
<text x="${centre.toFixed(1)}" y="${(y - 8).toFixed(1)}" font-family="${MONO}" font-size="9" fill="${theme.muted}" text-anchor="middle">${esc(percent)}</text>
<text x="${centre.toFixed(1)}" y="${axisY + 12}" font-family="${MONO}" font-size="9" fill="${theme.text}" text-anchor="end" transform="rotate(-40 ${centre.toFixed(1)} ${axisY + 12})">${esc(language.name)}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Language spectrum: ${esc(languages.map((l) => `${l.name} ${(l.share * 100).toFixed(0)} percent`).join(', ')) || 'no data'}">
${panel(theme, 'LANGUAGE SPECTRUM')}
${bars}
<line x1="${left}" y1="${axisY}" x2="${right}" y2="${axisY}" stroke="${theme.grid}" stroke-width="1"/>
</svg>`;
}
