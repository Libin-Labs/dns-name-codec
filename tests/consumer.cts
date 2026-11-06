import api = require('@lp-labs/dns-name-codec');
const wire: Uint8Array = api.encodeDnsName('example.test');
void wire;
