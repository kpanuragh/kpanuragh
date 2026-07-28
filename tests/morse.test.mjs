import { test } from 'node:test';
import assert from 'node:assert/strict';
import { morse } from '../tools/morse.mjs';

test('encodes the profile name correctly', () => {
  const encoded = morse('ANURAGH K P');
  // "ANURAGH K P" carries two spaces: after ANURAGH, and between the K and P
  // initials. Each renders as a word gap with no elements of its own.
  assert.deepEqual(encoded.map((e) => e.symbols), [
    '.-', '-.', '..-', '.-.', '.-', '--.', '....',
    '',
    '-.-',
    '',
    '.--.',
  ]);
});

test('the name contains exactly 26 keyed elements', () => {
  const total = morse('ANURAGH K P').reduce((sum, e) => sum + e.symbols.length, 0);
  assert.equal(total, 26, 'the hero test asserts this same count');
});

test('preserves the characters alongside their symbols', () => {
  assert.deepEqual(morse('SOS'), [
    { char: 'S', symbols: '...' },
    { char: 'O', symbols: '---' },
    { char: 'S', symbols: '...' },
  ]);
});

test('is case insensitive', () => {
  assert.deepEqual(morse('sos'), morse('SOS'));
});

test('marks word gaps with an empty symbol string', () => {
  const gap = morse('A B')[1];
  assert.equal(gap.char, ' ');
  assert.equal(gap.symbols, '');
});

test('throws on an unsupported character', () => {
  assert.throws(() => morse('A#B'), /unsupported/i);
});

test('encodes digits', () => {
  assert.equal(morse('0')[0].symbols, '-----');
  assert.equal(morse('5')[0].symbols, '.....');
});
