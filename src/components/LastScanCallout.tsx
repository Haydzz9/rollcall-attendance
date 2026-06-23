export interface LastScan {
  name: string;
  id: string;
  kind: 'ok' | 'dup' | 'warn';
  message: string;
}

export function LastScanCallout({ scan }: { scan: LastScan | null }) {
  if (!scan) return null;
  const cls = scan.kind === 'dup' ? 'dup' : scan.kind === 'warn' ? 'warn' : '';
  return (
    <div className={`last-scan ${cls}`}>
      <div className="ls-label">{scan.message}</div>
      <div className="ls-name">{scan.name}</div>
      <div className="ls-id">ID: {scan.id}</div>
    </div>
  );
}
