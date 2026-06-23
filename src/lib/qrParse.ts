export interface ParsedCode {
  id: string;
  name: string;
  matched: boolean;
}

/**
 * Printed ID cards encode "<ID>/<Name>" (e.g. "3018/Limson, Haydee D") directly in the QR.
 * URLs contain "/" too (e.g. a test QR from a generator site) but are never a valid pair,
 * so they're rejected rather than misparsed into a garbage id/name.
 */
export function parseScannedCode(raw: string): ParsedCode {
  const s = raw.trim();
  const slashIndex = s.indexOf('/');
  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(s);
  if (slashIndex === -1 || looksLikeUrl) {
    return { id: s || '(unknown)', name: '', matched: false };
  }

  const id = s.slice(0, slashIndex).trim() || '(unknown)';
  const name = s.slice(slashIndex + 1).trim() || '(unknown)';
  return { id, name, matched: true };
}
