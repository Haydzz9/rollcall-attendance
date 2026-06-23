interface Props {
  disabled: boolean;
  driveConnected: boolean;
  syncing: boolean;
  onDownload: () => void;
  onSyncNow: () => void;
  onClear: () => void;
}

export function ExportBar({ disabled, driveConnected, syncing, onDownload, onSyncNow, onClear }: Props) {
  return (
    <div className="export-bar">
      <button className="primary" disabled={disabled} onClick={onDownload}>
        Download CSV
      </button>
      {driveConnected && (
        <button className="outline" disabled={disabled || syncing} onClick={onSyncNow}>
          {syncing ? 'Syncing…' : 'Sync to Drive now'}
        </button>
      )}
      <button className="danger" disabled={disabled} onClick={onClear}>
        Clear roll
      </button>
    </div>
  );
}
