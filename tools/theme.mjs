export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, Liberation Mono, monospace';

export const THEMES = {
  dark: {
    name: 'dark',
    ground: '#0b0f14',
    panel: '#111820',
    grid: '#1e293b',
    carrier: '#22d3ee',
    peak: '#fbbf24',
    text: '#e6edf3',
    muted: '#7d8590',
  },
  light: {
    name: 'light',
    ground: '#f6f8fa',
    panel: '#ffffff',
    grid: '#d0d7de',
    carrier: '#0891b2',
    peak: '#b45309',
    text: '#1f2328',
    muted: '#59636e',
  },
};

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };

export function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}
