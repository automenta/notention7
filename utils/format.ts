import {bytesToHex as bytesToHexOriginal, hexToBytes as hexToBytesOriginal} from '@noble/curves/abstract/utils';

export const DEFAULT_RELAYS = [
    'wss://relay.damus.io',
    'wss://relay.snort.social',
    'wss://nostr.wine',
    'wss://nostr-pub.wellorder.net',
    'wss://nos.lol',
];

export function formatNpub(npub: string) {
  return `${npub.substring(0, 8)}...${npub.substring(npub.length - 8)}`;
}

export function bytesToHex(bytes: Uint8Array): string {
  return bytesToHexOriginal(bytes);
}

export function hexToBytes(hex: string): Uint8Array {
  return hexToBytesOriginal(hex);
}
