import { describe, expect, it } from 'vitest';
import { parseScannedCode } from '../qrParse';

describe('parseScannedCode', () => {
  const roster = { '3018': 'Limson, Haydee D', '42': 'Doe, Jane' };

  it('parses legacy "ID/Name" combined codes without needing a roster entry', () => {
    expect(parseScannedCode('3018/Limson, Haydee D', {})).toEqual({
      id: '3018',
      name: 'Limson, Haydee D',
      matched: true
    });
  });

  it('looks up an ID-only code in the roster', () => {
    expect(parseScannedCode('42', roster)).toEqual({ id: '42', name: 'Doe, Jane', matched: true });
  });

  it('flags an ID-only code that is not in the roster', () => {
    expect(parseScannedCode('999', roster)).toEqual({ id: '999', name: '', matched: false });
  });

  it('trims whitespace around the raw scanned value', () => {
    expect(parseScannedCode('  42  ', roster)).toEqual({ id: '42', name: 'Doe, Jane', matched: true });
  });

  it('falls back to "(unknown)" for an empty legacy id/name', () => {
    expect(parseScannedCode('/', {})).toEqual({ id: '(unknown)', name: '(unknown)', matched: true });
  });

  it('does not mistake a scanned URL (e.g. a test QR generator link) for legacy ID/Name', () => {
    const result = parseScannedCode('https://qr.generatorqr.com/abc123', {});
    expect(result.matched).toBe(false);
    expect(result.id).not.toBe('https:');
  });

  it('treats an http URL the same way', () => {
    const result = parseScannedCode('http://example.com/path/to/thing', { '42': 'Jane' });
    expect(result.matched).toBe(false);
  });
});
