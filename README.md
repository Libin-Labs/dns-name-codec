# @lp-labs/dns-name-codec

ASCII DNS name wire encoder and decoder for uncompressed LDH labels. DNS compression pointers and
IDNA conversion are intentionally unsupported. Independent, with zero runtime or peer
dependencies.

## Install and quickstart

```bash
npm install @lp-labs/dns-name-codec
```

```js
import { encodeDnsName, decodeDnsName } from '@lp-labs/dns-name-codec';

const wire = encodeDnsName('www.example.test.');
const decoded = decodeDnsName(wire);
if (decoded.name !== 'www.example.test' || decoded.nextOffset !== wire.length) {
  throw new Error('DNS wire roundtrip failed');
}
```

## API and supported format

- `encodeDnsName(name): Uint8Array` emits length-prefixed ASCII labels and a terminating root
  octet. Empty string and `.` encode the root.
- `decodeDnsName(wire, offset?): { name: string; nextOffset: number }` reads one uncompressed
  name and reports the offset immediately after its root octet.

Names accept ASCII letters, digits and interior hyphens, with labels up to 63 octets and total
wire length up to 255 octets. One terminal dot is accepted; decoded names are lowercase-preserving
wire spelling (no forced case normalization). Malformed labels, truncation, non-ASCII bytes,
invalid offsets, and compression pointers are rejected with `TypeError` or `RangeError`.

Both operations are O(n) and allocate output proportional to encoded name length. This is not a
full DNS message parser: it does not follow compression pointers, implement IDNA/Unicode mapping,
validate Punycode A-label semantics, process escaped presentation syntax, or handle record
sections. Callers must normalize names appropriately for their own DNS use.

Runtime exports: `encodeDnsName`, `decodeDnsName`. ESM/CommonJS declarations; Node.js 18+,
ES2022, no browser globals.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
