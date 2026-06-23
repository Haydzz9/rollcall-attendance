import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useDriveAuth } from './hooks/useDriveAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { AuthGate } from './components/AuthGate';
import { WhoBar } from './components/WhoBar';
import { SessionPanel } from './components/SessionPanel';
import { DrivePanel } from './components/DrivePanel';
import { ScannerPanel, type DecodeOutcome } from './components/ScannerPanel';
import { LastScanCallout, type LastScan } from './components/LastScanCallout';
import { AttendanceRoll } from './components/AttendanceRoll';
import { ExportBar } from './components/ExportBar';
import { SessionsHistoryPanel } from './components/SessionsHistoryPanel';
import { BottomNav, type Tab } from './components/BottomNav';
import { getSessions, saveSessions } from './lib/db';
import { downloadSessionCsv } from './lib/csv';
import { parseScannedCode } from './lib/qrParse';
import { trySyncSession, withSessionLock } from './lib/sync';
import type { AttendanceRecord, SessionInfo, SessionRecord } from './types';

function nowDateTime(): { date: string; time: string } {
  const now = new Date();
  return { date: now.toISOString().slice(0, 10), time: now.toTimeString().slice(0, 5) };
}

function emptySessionInfo(): SessionInfo {
  return { event: '', subject: '', section: '', ...nowDateTime() };
}

export default function App() {
  const { profile, error: authError, configured: authConfigured, signOut } = useAuth();
  const { connected: driveConnected, configured: driveConfigured, connect, disconnect } = useDriveAuth();

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);
  // Source of truth for sync logic: updated synchronously (not just on render) so a
  // queued sync always sees the latest session state, even mid-batch of rapid scans.
  const sessionsRef = useRef<SessionRecord[]>([]);

  const updateSessions = useCallback((updater: (prev: SessionRecord[]) => SessionRecord[]) => {
    const next = updater(sessionsRef.current);
    sessionsRef.current = next;
    setSessions(next);
  }, []);

  const [draftInfo, setDraftInfo] = useState<SessionInfo>(emptySessionInfo());
  const [locked, setLocked] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastScan, setLastScan] = useState<LastScan | null>(null);
  const [driveStatus, setDriveStatus] = useState<{ text: string; error: boolean } | null>(null);
  const [syncingManual, setSyncingManual] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    getSessions().then((s) => {
      sessionsRef.current = s;
      setSessions(s);
      setSessionsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (sessionsLoaded) saveSessions(sessions);
  }, [sessions, sessionsLoaded]);

  const currentSession = sessions.find((s) => s.sessionId === currentSessionId) ?? null;

  // Queued per-session: looks up the latest session state right when its turn runs,
  // so a sync triggered by an earlier scan can't be overtaken by one from a later scan.
  const syncSession = useCallback(
    (sessionId: string) => {
      if (!driveConnected) return Promise.resolve();
      return withSessionLock(sessionId, async () => {
        const session = sessionsRef.current.find((s) => s.sessionId === sessionId);
        if (!session) return;
        const result = await trySyncSession(session);
        updateSessions((prev) =>
          prev.map((s) =>
            s.sessionId === sessionId
              ? { ...s, sheetsTabTitle: result.sheetsTabTitle, driveSynced: result.driveSynced, syncError: result.syncError }
              : s
          )
        );
        setDriveStatus(
          result.driveSynced
            ? { text: `Backed up to Drive · ${session.records.length} scan${session.records.length === 1 ? '' : 's'}`, error: false }
            : { text: result.syncError ?? 'Sync pending', error: true }
        );
      });
    },
    [driveConnected, updateSessions]
  );

  const online = useOnlineStatus(
    useCallback(() => {
      if (!driveConnected) return;
      sessionsRef.current.filter((s) => !s.driveSynced).forEach((s) => void syncSession(s.sessionId));
    }, [driveConnected, syncSession])
  );

  const handleLockToggle = useCallback(() => {
    if (!locked) {
      const sessionId = crypto.randomUUID();
      const newSession: SessionRecord = {
        sessionId,
        info: draftInfo,
        records: [],
        sheetsTabTitle: null,
        driveSynced: false,
        syncError: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      updateSessions((prev) => [...prev, newSession]);
      setCurrentSessionId(sessionId);
      setLastScan(null);
      setDriveStatus(null);
      setLocked(true);
    } else {
      setLocked(false);
    }
  }, [locked, draftInfo, updateSessions]);

  const handleDecode = useCallback(
    (raw: string): DecodeOutcome => {
      if (!currentSession) return 'warn';
      const { id, name, matched } = parseScannedCode(raw);

      if (!matched) {
        setLastScan({ name: '(unrecognized)', id, kind: 'warn', message: 'Unrecognized code — expected ID/Name format' });
        return 'warn';
      }

      const already = currentSession.records.find((r) => r.id === id);
      if (already) {
        setLastScan({ name: already.name, id, kind: 'dup', message: 'Already recorded' });
        return 'dup';
      }

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const record: AttendanceRecord = { id, name, date: currentSession.info.date, time: timeStr, status: 'Present' };
      const sessionId = currentSession.sessionId;
      updateSessions((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, records: [...s.records, record], updatedAt: Date.now() } : s))
      );
      setLastScan({ name, id, kind: 'ok', message: 'Recorded' });
      void syncSession(sessionId);
      return 'ok';
    },
    [currentSession, syncSession, updateSessions]
  );

  const handleRemoveRecord = useCallback(
    (index: number) => {
      if (!currentSession) return;
      const sessionId = currentSession.sessionId;
      updateSessions((prev) =>
        prev.map((s) => (s.sessionId === sessionId ? { ...s, records: s.records.filter((_, i) => i !== index), updatedAt: Date.now() } : s))
      );
    },
    [currentSession, updateSessions]
  );

  const handleClearRoll = useCallback(() => {
    if (!currentSession || currentSession.records.length === 0) return;
    if (!window.confirm(`Clear all ${currentSession.records.length} recorded scans? This cannot be undone.`)) return;
    const sessionId = currentSession.sessionId;
    updateSessions((prev) =>
      prev.map((s) =>
        s.sessionId === sessionId ? { ...s, records: [], driveSynced: false, syncError: null, updatedAt: Date.now() } : s
      )
    );
    setLastScan(null);
  }, [currentSession, updateSessions]);

  const handleSyncNow = useCallback(async () => {
    if (!currentSession) return;
    setSyncingManual(true);
    await syncSession(currentSession.sessionId);
    setSyncingManual(false);
  }, [currentSession, syncSession]);

  const handleRetrySync = useCallback(
    async (sessionId: string) => {
      setRetryingId(sessionId);
      await syncSession(sessionId);
      setRetryingId(null);
    },
    [syncSession]
  );

  const [activeTab, setActiveTab] = useState<Tab>('scan');

  if (!profile) {
    return <AuthGate configured={authConfigured} error={authError} />;
  }

  return (
    <div className="wrap">
      <header>
        <p className="eyebrow">DMMMSU-SLUC · College of Computer Science</p>
        <h1>
          Roll<em>Call</em>
        </h1>
        <p className="sub">qr attendance ledger — live camera scan{!online ? ' · offline' : ''}</p>
      </header>
      <WhoBar profile={profile} onSignOut={signOut} />

      {activeTab === 'scan' && (
        <>
          <SessionPanel info={draftInfo} locked={locked} onChange={setDraftInfo} onLockToggle={handleLockToggle} />
          <DrivePanel
            configured={driveConfigured}
            connected={driveConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            statusText={driveStatus?.text ?? null}
            statusError={driveStatus?.error ?? false}
          />
          <ScannerPanel key={`${currentSessionId}-${locked}`} locked={locked} onDecode={handleDecode} />
          <LastScanCallout scan={lastScan} />
          <AttendanceRoll records={currentSession?.records ?? []} onRemove={handleRemoveRecord} />
          <ExportBar
            disabled={!currentSession || currentSession.records.length === 0}
            driveConnected={driveConnected}
            syncing={syncingManual}
            onDownload={() => currentSession && downloadSessionCsv(currentSession.info, currentSession.records)}
            onSyncNow={handleSyncNow}
            onClear={handleClearRoll}
          />
          <p className="footnote">
            Each "Lock session" starts a fresh roll.
            <br />
            Tap "Download CSV" to save locally — sign in to Drive Backup above to also auto-sync each scan.
          </p>
        </>
      )}

      {activeTab === 'sessions' && (
        <SessionsHistoryPanel
          sessions={sessions}
          driveConnected={driveConnected}
          retryingId={retryingId}
          onRetrySync={handleRetrySync}
        />
      )}

      <p className="footnote">Programmer: Haydee Dulay-Limson</p>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
