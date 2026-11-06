const LABEL = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)$(?![\s\S])/;
const MAX_WIRE_LENGTH = 255;

function labels(name: string): string[] {
  if (typeof name !== 'string' || name.length > 253 || /[^\x00-\x7f]/.test(name))
    throw new TypeError('DNS name must be an ASCII name no longer than 253 characters.');
  if (name === '' || name === '.') return [];
  const normalized = name.endsWith('.') ? name.slice(0, -1) : name;
  const parts = normalized.split('.');
  if (parts.some((part) => !LABEL.test(part))) throw new TypeError('Invalid DNS LDH label.');
  return parts;
}

export function encodeDnsName(name: string): Uint8Array {
  const parts = labels(name);
  const length = parts.reduce((sum, label) => sum + label.length + 1, 1);
  if (length > MAX_WIRE_LENGTH) throw new RangeError('DNS wire name exceeds 255 octets.');
  const out = new Uint8Array(length);
  let offset = 0;
  for (const label of parts) {
    out[offset++] = label.length;
    for (let i = 0; i < label.length; i++) out[offset++] = label.charCodeAt(i);
  }
  out[offset] = 0;
  return out;
}

export function decodeDnsName(wire: Uint8Array, offset = 0): { name: string; nextOffset: number } {
  if (
    !(wire instanceof Uint8Array) ||
    !Number.isSafeInteger(offset) ||
    offset < 0 ||
    offset >= wire.length
  )
    throw new RangeError('Invalid DNS wire input or offset.');
  const parts: string[] = [];
  let cursor = offset,
    consumed = 0;
  while (true) {
    if (cursor >= wire.length || consumed >= MAX_WIRE_LENGTH)
      throw new TypeError('Truncated or oversized DNS name.');
    const length = wire[cursor++]!;
    consumed++;
    if (length === 0) break;
    if ((length & 0xc0) !== 0)
      throw new TypeError('Compressed DNS name pointers are not supported.');
    if (length > 63 || cursor + length > wire.length || consumed + length > MAX_WIRE_LENGTH)
      throw new TypeError('Invalid DNS label length.');
    let label = '';
    for (let i = 0; i < length; i++) {
      const byte = wire[cursor++]!;
      if (byte > 0x7f) throw new TypeError('DNS name contains a non-ASCII octet.');
      label += String.fromCharCode(byte);
    }
    if (!LABEL.test(label)) throw new TypeError('Invalid DNS LDH label in wire data.');
    parts.push(label);
    consumed += length;
  }
  return { name: parts.join('.'), nextOffset: cursor };
}
