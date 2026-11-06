import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { encodeDnsName, decodeDnsName } from '../dist/esm/index.js';

test('encodes standard DNS labels and terminates with the root octet', () => {
  assert.deepEqual(
    [...encodeDnsName('www.example.com')],
    [3, 119, 119, 119, 7, 101, 120, 97, 109, 112, 108, 101, 3, 99, 111, 109, 0],
  );
});
test('encodes the root label and accepts one trailing dot', () => {
  assert.deepEqual([...encodeDnsName('.')], [0]);
  assert.equal(decodeDnsName(encodeDnsName('example.test.')).name, 'example.test');
});
test('decodes one name inside a larger wire message and reports the next offset', () => {
  const wire = new Uint8Array([9, 1, 120, 0, 8]);
  assert.deepEqual(decodeDnsName(wire, 1), { name: 'x', nextOffset: 4 });
});
test('rejects non-ASCII, invalid LDH labels, and overlong labels', () => {
  for (const name of [
    'éxample.test',
    '-bad.test',
    'bad-.test',
    'example.test\n',
    `${'a'.repeat(64)}.test`,
    `a_${'b'}.test`,
  ])
    assert.throws(() => encodeDnsName(name), TypeError);
});
test('rejects compressed pointers, truncated data, and invalid wire labels', () => {
  for (const bytes of [
    [0xc0, 0],
    [3, 97],
    [2, 97, 95, 0],
    [64, ...Array(64).fill(97), 0],
  ])
    assert.throws(() => decodeDnsName(new Uint8Array(bytes)), TypeError);
});
test('enforces presentation and wire bounds and valid offsets', () => {
  assert.throws(() => encodeDnsName(Array(4).fill('a'.repeat(63)).join('.')), TypeError);
  assert.throws(() => decodeDnsName(new Uint8Array([0]), 1), RangeError);
});
test('CommonJS exposes name wire functions', () => {
  const api = createRequire(import.meta.url)('../dist/cjs/index.js');
  assert.deepEqual(Object.keys(api).sort(), ['decodeDnsName', 'encodeDnsName']);
});
