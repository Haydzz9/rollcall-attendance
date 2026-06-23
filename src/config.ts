export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

// drive.file also authorizes the Sheets API for files this app creates.
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const DRIVE_FOLDER_NAME = 'RollCall Attendance';
export const SHEETS_FILE_NAME = 'RollCall Attendance';
export const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

export function isGoogleConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID) && !GOOGLE_CLIENT_ID.includes('YOUR_CLIENT_ID');
}
