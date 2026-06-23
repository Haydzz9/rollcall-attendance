export interface ParsedCode {
  id: string;
  name: string;
  matched: boolean;
}

/**
 * Scanned codes are normally "<ID>" looked up against the roster.
 * Codes containing a "/" are treated as the legacy "<ID>/<Name>" format
 * from already-printed cards, so those keep working without a roster entry.
 * URLs (e.g. test QR codes from a generator site) contain "/" too but are
 * never a valid "<ID>/<Name>" pair, so they're excluded and fall through to
 * the roster lookup instead (where they'll correctly come back unmatched).
 */
export function parseScannedCode(raw: string, roster: Record<string, string>): ParsedCode {
  const s = raw.trim();
  const slashIndex = s.indexOf('/');
  const looksLikeUrl = /^[a-z][a-z0-9+.-]*:\/\//i.test(s);
  if (slashIndex !== -1 && !looksLikeUrl) {
    const id = s.slice(0, slashIndex).trim() || '(unknown)';
    const name = s.slice(slashIndex + 1).trim() || '(unknown)';
    return { id, name, matched: true };
  }

  const id = s || '(unknown)';
  const name = roster[id];
  return { id, name: name ?? '', matched: Boolean(name) };
}
