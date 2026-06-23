import { downloadSessionCsv } from '../lib/csv';
import type { SessionRecord } from '../types';

interface Props {
  sessions: SessionRecord[];
  driveConnected: boolean;
  retryingId: string | null;
  onRetrySync: (sessionId: string) => void;
}

export function SessionsHistoryPanel({ sessions, driveConnected, retryingId, onRetrySync }: Props) {
  const sorted = [...sessions].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Session History</h2>
        <span className="stamp">{sessions.length} saved</span>
      </div>
      <div className="panel-body">
        {sorted.length === 0 ? (
          <div className="empty-row">No sessions recorded yet.</div>
        ) : (
          sorted.map((s) => (
            <div key={s.sessionId} className="session-summary" style={{ marginBottom: 10 }}>
              <b>{s.info.event || '—'}</b> · {s.info.subject || '—'} · {s.info.section || '—'}
              <br />
              {s.info.date} {s.info.time} · {s.records.length} recorded
              <br />
              {s.driveSynced ? (
                <span>Synced to Drive</span>
              ) : s.syncError ? (
                <span style={{ color: 'var(--err)' }}>Sync failed: {s.syncError}</span>
              ) : (
                <span>Not yet synced</span>
              )}
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button className="btn-sm" onClick={() => downloadSessionCsv(s.info, s.records)}>
                  Download CSV
                </button>
                {driveConnected && !s.driveSynced && (
                  <button className="btn-sm" disabled={retryingId === s.sessionId} onClick={() => onRetrySync(s.sessionId)}>
                    {retryingId === s.sessionId ? 'Syncing…' : 'Retry sync'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
