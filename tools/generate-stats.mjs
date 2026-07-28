#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { THEMES } from './theme.mjs';
import { fetchStats } from './fetch-stats.mjs';
import { renderStats, renderSpectrum } from './svg-stats.mjs';

export async function generate({ token, login, outDir, fetchImpl = fetch }) {
  const stats = await fetchStats({ token, login, fetchImpl });

  // Render everything before touching disk: a partial failure must leave the
  // previous assets in place rather than commit a broken card.
  const pending = [];
  for (const theme of Object.values(THEMES)) {
    pending.push([`stats-${theme.name}.svg`, renderStats(stats, theme)]);
    pending.push([`spectrum-${theme.name}.svg`, renderSpectrum(stats.languages, theme)]);
  }

  mkdirSync(outDir, { recursive: true });
  const written = [];
  for (const [name, svg] of pending) {
    const path = join(outDir, name);
    writeFileSync(path, `${svg}\n`, 'utf8');
    written.push(path);
  }
  return written;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.PROFILE_LOGIN || 'kpanuragh';
  if (!token) {
    console.error('GITHUB_TOKEN is not set');
    process.exit(1);
  }

  const outDir = join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets');
  try {
    const written = await generate({ token, login, outDir });
    console.log(`wrote ${written.length} statistics assets`);
  } catch (error) {
    console.error(`stats generation failed, leaving existing assets untouched: ${error.message}`);
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
