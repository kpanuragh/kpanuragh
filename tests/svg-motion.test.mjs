import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pulse, staggerBrighten, seamlessTranslate, wipeAndRetype } from '../tools/svg-motion.mjs';

function attr(svgFragment, name) {
  const match = svgFragment.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

function keyTimesOf(fragment) {
  return attr(fragment, 'keyTimes').split(';').map(Number);
}

test('pulse starts at full opacity', () => {
  const out = pulse({ values: '1;0.25;1', dur: '2.4s' });
  assert.equal(attr(out, 'attributeName'), 'opacity');
  assert.equal(attr(out, 'values').split(';')[0], '1');
});

test('staggerBrighten never drops below rest opacity', () => {
  const out = staggerBrighten({ index: 2, count: 6, cycle: 12 });
  const values = attr(out, 'values').split(';').map(Number);
  assert.ok(Math.min(...values) > 0, 'content must never be fully hidden');
  assert.equal(values[0], Math.min(...values), 't=0 must be the rest value');
});

test('staggerBrighten keyTimes are normalised and non-decreasing', () => {
  for (let index = 0; index < 6; index += 1) {
    const times = keyTimesOf(staggerBrighten({ index, count: 6, cycle: 12 }));
    assert.equal(times[0], 0, 'must start at 0');
    assert.equal(times[times.length - 1], 1, 'must end at 1');
    for (let i = 1; i < times.length; i += 1) {
      assert.ok(times[i] >= times[i - 1], `keyTimes must not decrease (index ${index})`);
    }
  }
});

test('staggerBrighten peaks later for later items', () => {
  const peakTime = (index) => {
    const out = staggerBrighten({ index, count: 6, cycle: 12 });
    const values = attr(out, 'values').split(';').map(Number);
    const times = keyTimesOf(out);
    return times[values.indexOf(Math.max(...values))];
  };
  assert.ok(peakTime(0) < peakTime(3), 'item 0 must peak before item 3');
  assert.ok(peakTime(3) < peakTime(5), 'item 3 must peak before item 5');
});

test('seamlessTranslate starts undisplaced', () => {
  const out = seamlessTranslate({ dx: -50, dy: 0, dur: '2s' });
  assert.equal(attr(out, 'type'), 'translate');
  assert.equal(attr(out, 'values').split(';')[0].trim(), '0 0');
});

test('wipeAndRetype starts at full width and returns to full width', () => {
  const out = wipeAndRetype({ width: 400, dur: '12s', startAt: 0.6, endAt: 0.9 });
  const values = attr(out, 'values').split(';').map(Number);
  assert.equal(attr(out, 'attributeName'), 'width');
  assert.equal(values[0], 400, 't=0 must be fully typed');
  assert.equal(values[values.length - 1], 400);
  assert.ok(values.includes(0), 'must wipe to zero at some point');
});

test('wipeAndRetype keyTimes are non-decreasing and normalised', () => {
  const times = keyTimesOf(wipeAndRetype({ width: 400, dur: '12s', startAt: 0.6, endAt: 0.9 }));
  assert.equal(times[0], 0);
  assert.equal(times[times.length - 1], 1);
  for (let i = 1; i < times.length; i += 1) {
    assert.ok(times[i] >= times[i - 1]);
  }
});
