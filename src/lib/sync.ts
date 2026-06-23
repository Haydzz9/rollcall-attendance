import { buildAttendanceCsv, csvFilename } from './csv';
import { uploadCsvToDrive } from './driveApi';
import { ensureSessionTab, writeSessionRows } from './sheetsApi';
import { isDriveConnected } from './googleDriveAuth';
import type { SessionRecord } from '../types';

export interface SyncResult {
  sheetsTabTitle: string | null;
  driveSynced: boolean;
  syncError: string | null;
}

export async function trySyncSession(session: SessionRecord): Promise<SyncResult> {
  if (!isDriveConnected()) {
    return { sheetsTabTitle: session.sheetsTabTitle, driveSynced: false, syncError: 'Drive not connected' };
  }
  let tabTitle = session.sheetsTabTitle;
  try {
    if (!tabTitle) {
      tabTitle = await ensureSessionTab(session.info);
      if (!tabTitle) throw new Error('Could not create session sheet tab.');
    }
    await writeSessionRows(tabTitle, session.info, session.records);
    await uploadCsvToDrive(csvFilename(session.info), buildAttendanceCsv(session.info, session.records));
    return { sheetsTabTitle: tabTitle, driveSynced: true, syncError: null };
  } catch (err) {
    return {
      sheetsTabTitle: tabTitle,
      driveSynced: false,
      syncError: err instanceof Error ? err.message : 'Sync failed'
    };
  }
}

const sessionLocks = new Map<string, Promise<unknown>>();

/**
 * Runs fn for a given session one-at-a-time, queued after any sync already in flight
 * for that same session. Without this, two scans fired in quick succession could both
 * see `sheetsTabTitle: null` and race to create the session's Sheets tab.
 */
export function withSessionLock<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
  const prior = sessionLocks.get(sessionId) ?? Promise.resolve();
  const run = prior.then(fn, fn);
  sessionLocks.set(
    sessionId,
    run.catch(() => undefined)
  );
  return run;
}
