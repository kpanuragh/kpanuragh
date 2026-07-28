#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { THEMES } from './theme.mjs';
import { renderHero } from './svg-hero.mjs';
import { renderHeader } from './svg-headers.mjs';
import { renderBandPlan } from './svg-bandplan.mjs';

export const SECTIONS = [
  { slug: 'on-air', label: 'ON AIR' },
  { slug: 'strong-signals', label: 'STRONG SIGNALS' },
  { slug: 'upstream', label: 'UPSTREAM' },
  { slug: 'noise-floor', label: 'NOISE FLOOR' },
  { slug: 'band-plan', label: 'BAND PLAN' },
  { slug: 'telemetry', label: 'TELEMETRY' },
  { slug: 'contact', label: 'CONTACT' },
];

const assetsDir = join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets');

function build() {
  mkdirSync(assetsDir, { recursive: true });
  const written = [];
  for (const theme of Object.values(THEMES)) {
    written.push(['hero', renderHero(theme), theme.name]);
    written.push(['band-plan', renderBandPlan(theme), theme.name]);
    for (const section of SECTIONS) {
      written.push([`hdr-${section.slug}`, renderHeader(section.label, theme), theme.name]);
    }
  }
  for (const [base, svg, themeName] of written) {
    writeFileSync(join(assetsDir, `${base}-${themeName}.svg`), `${svg}\n`, 'utf8');
  }
  console.log(`wrote ${written.length} static assets to assets/`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  build();
}
