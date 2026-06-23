import { DRIVE_FOLDER_NAME } from '../config';
import { ensureFreshToken } from './googleDriveAuth';

let driveFolderId: string | null = null;

export async function ensureDriveFolder(): Promise<string | null> {
  if (driveFolderId) return driveFolderId;
  const token = await ensureFreshToken();
  if (!token) return null;
  const q = encodeURIComponent(
    `name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)`, {
    headers: { Authorization: 'Bearer ' + token }
  });
  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    driveFolderId = searchData.files[0].id;
    return driveFolderId;
  }
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: DRIVE_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' })
  });
  const createData = await createRes.json();
  driveFolderId = createData.id ?? null;
  return driveFolderId;
}

export async function uploadCsvToDrive(filename: string, csvText: string): Promise<void> {
  const token = await ensureFreshToken();
  if (!token) throw new Error('Drive session expired — sign in to Drive Backup again.');
  const folderId = await ensureDriveFolder();
  if (!folderId) throw new Error('Could not reach Drive folder.');

  const metadata = { name: filename, parents: [folderId], mimeType: 'text/csv' };
  const boundary = '-------rollcall' + Date.now();
  const body =
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: text/csv\r\n\r\n${csvText}\r\n` +
    `--${boundary}--`;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });
  if (!res.ok) {
    throw new Error('Drive upload failed (status ' + res.status + ')');
  }
}
