import { SHEETS_API, SHEETS_FILE_NAME } from '../config';
import { ensureFreshToken } from './googleDriveAuth';
import type { AttendanceRecord, SessionInfo } from '../types';

let spreadsheetId: string | null = null;

function quotedTab(tabTitle: string): string {
  return "'" + tabTitle.replace(/'/g, "''") + "'";
}

export async function ensureSheetsSpreadsheet(): Promise<string | null> {
  if (spreadsheetId) return spreadsheetId;
  const token = await ensureFreshToken();
  if (!token) return null;
  const q = encodeURIComponent(
    `name='${SHEETS_FILE_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
  );
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    spreadsheetId = searchData.files[0].id;
    return spreadsheetId;
  }
  const createRes = await fetch(SHEETS_API, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties: { title: SHEETS_FILE_NAME } })
  });
  const createData = await createRes.json();
  spreadsheetId = createData.spreadsheetId ?? null;
  return spreadsheetId;
}

function sessionTabName(info: SessionInfo): string {
  const safe = (str: string) => (str || '').replace(/[:\\/?*[\]]/g, '-').trim();
  const parts = [safe(info.subject), safe(info.section), info.date, info.time].filter(Boolean);
  const title = parts.length ? parts.join(' ') : 'Session ' + Date.now();
  return title.slice(0, 95);
}

/** Creates a fresh, empty tab for this session. Caller must not call this twice
 *  for the same session — sync.ts serializes per-session syncs to guarantee that. */
export async function ensureSessionTab(info: SessionInfo): Promise<string | null> {
  const id = await ensureSheetsSpreadsheet();
  if (!id) return null;
  const token = await ensureFreshToken();
  if (!token) return null;

  const title = sessionTabName(info);
  const addRes = await fetch(`${SHEETS_API}/${id}:batchUpdate`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ requests: [{ addSheet: { properties: { title } } }] })
  });
  if (!addRes.ok) {
    throw new Error('Could not create sheet tab for this session.');
  }
  return title;
}

/**
 * Overwrites the entire tab with the current header block + every attendance row in one
 * request, instead of incrementally appending. Incremental appends raced with each other
 * across rapid scans (Sheets' "append after last row" position is computed per-request, so
 * two in-flight requests could land in the wrong order); a full rewrite is atomic and
 * idempotent, so re-running it after a retry can never corrupt row order.
 */
export async function writeSessionRows(tabTitle: string, info: SessionInfo, records: AttendanceRecord[]): Promise<void> {
  const id = await ensureSheetsSpreadsheet();
  if (!id) throw new Error('Could not reach Sheets.');
  const token = await ensureFreshToken();
  if (!token) throw new Error('Drive session expired — sign in to Drive Backup again.');

  const headerRows: (string | undefined)[][] = [
    ['Event', info.event],
    ['Subject', info.subject],
    ['Section', info.section],
    ['Date', info.date],
    ['Time', info.time],
    [],
    ['ID', 'Name', 'Date', 'Time', 'Status']
  ];
  const dataRows = records.map((r) => [r.id, r.name, r.date, r.time, r.status]);
  const values = [...headerRows, ...dataRows];

  await fetch(`${SHEETS_API}/${id}/values/${encodeURIComponent(quotedTab(tabTitle))}:clear`, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token }
  });

  const range = `${quotedTab(tabTitle)}!A1:E${values.length}`;
  const res = await fetch(`${SHEETS_API}/${id}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ range, values })
  });
  if (!res.ok) {
    throw new Error('Sheet update failed (status ' + res.status + ')');
  }
}
