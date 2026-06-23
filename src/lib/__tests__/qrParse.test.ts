import { describe, expect, it } from 'vitest';
import { parseScannedCode } from '../qrParse';

describe('parseScannedCode', () => {
  it('parses "ID/Name" combined codes from printed ID cards', () => {
    expect(parseScannedCode('3018/Limson, Haydee D')).toEqual({
      id: '3018',
      name: 'Limson, Haydee D',
      matched: true
    });
  });

  it('trims whitespace around the raw scanned value', () => {
    expect(parseScannedCode('  42/Jane Doe  ')).toEqual({ id: '42', name: 'Jane Doe', matched: true });
  });

  it('falls back to "(unknown)" for an empty id or name half', () => {
    expect(parseScannedCode('/')).toEqual({ id: '(unknown)', name: '(unknown)', matched: true });
  });

  it('rejects a code with no "/" as unrecognized', () => {
    expect(parseScannedCode('999')).toEqual({ id: '999', name: '', matched: false });
  });

  it('does not mistake a scanned URL (e.g. a test QR generator link) for ID/Name', () => {
    const result = parseScannedCode('https://qr.generatorqr.com/abc123');
    expect(result.matched).toBe(false);
    expect(result.id).not.toBe('https:');
  });

  it('treats an http URL the same way', () => {
    const result = parseScannedCode('http://example.com/path/to/thing');
    expect(result.matched).toBe(false);
  });
});
