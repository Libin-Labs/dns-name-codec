import { encodeDnsName, decodeDnsName } from '@lp-labs/dns-name-codec';
const name: string = decodeDnsName(encodeDnsName('www.example.test')).name;
// @ts-expect-error wire input must be bytes.
decodeDnsName('www.example.test');
void name;
