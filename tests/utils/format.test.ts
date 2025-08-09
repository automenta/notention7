import {describe, it, expect} from 'vitest';
import {formatNpub, bytesToHex, hexToBytes} from '@/utils/format';

describe('formatNpub', () => {
  it('should format a valid npub key', () => {
    const npub = 'npub1l2vyh47mk2p0qr4rqylj8erfplqddfahtn8g9w8c6h6l9d8z2vsq0ws5mr';
    const formatted = formatNpub(npub);
    expect(formatted).toBe('npub1l2v...d8z2vsq0ws5mr');
  });

  it('should handle short strings', () => {
    const npub = 'short';
    const formatted = formatNpub(npub);
    expect(formatted).toBe('shor...ort');
  });
});

describe('bytesToHex and hexToBytes', () => {
  it('should convert bytes to hex and back', () => {
    const originalBytes = new Uint8Array([0, 1, 2, 3, 255, 254, 253, 252]);
    const hex = bytesToHex(originalBytes);
    expect(hex).toBe('00010203fffefdfc');
    const convertedBytes = hexToBytes(hex);
    expect(convertedBytes).toEqual(originalBytes);
  });

  it('should handle empty arrays', () => {
    const originalBytes = new Uint8Array([]);
    const hex = bytesToHex(originalBytes);
    expect(hex).toBe('');
    const convertedBytes = hexToBytes(hex);
    expect(convertedBytes).toEqual(originalBytes);
  });

  it('should handle single byte arrays', () => {
    const originalBytes = new Uint8Array([42]);
    const hex = bytesToHex(originalBytes);
    expect(hex).toBe('2a');
    const convertedBytes = hexToBytes(hex);
    expect(convertedBytes).toEqual(originalBytes);
  });
});
