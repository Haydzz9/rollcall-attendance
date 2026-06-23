# RollCall — QR Attendance (version 2)

React/TypeScript/PWA rewrite of the `attendance/attendance-scanner.html` prototype. Same Google account, Drive folder ("RollCall Attendance") and Google Sheet, rebuilt with a roster system, offline-safe session history, and installable PWA support. No backend — runs entirely in the browser.

## Run it

```bash
npm install
npm run dev
```

Open the printed `http://localhost:5173` URL in a browser with a camera (or use Chrome DevTools device emulation for layout, but live scanning needs a real camera).

## One-time Google Cloud setup

This reuses the existing OAuth Client ID from the `attendance` prototype (already has the Drive API and Sheets API enabled). You still need to:

1. Go to [Google Cloud Console → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials), open that OAuth 2.0 Client ID.
2. Under **Authorized JavaScript origins**, add `http://localhost:5173` (and whatever URL you deploy this to later).
3. Confirm `VITE_GOOGLE_CLIENT_ID` in `.env` matches that Client ID (already set).

Without step 2, sign-in and Drive Backup will fail with a redirect/origin error in the browser console.

## QR code format

- **New roster-based codes** (recommended going forward): the QR encodes just the person's **ID** (e.g. `3018`). Add that ID and the person's name to the **Roster** tab (CSV upload with an `ID,Name` header, or add manually) so the scanner can look up the name.
- **Legacy codes**: any QR that contains a `/`, e.g. `3018/Limson, Haydee D`, is still parsed as `ID/Name` directly (matching the original prototype's format) — already-printed cards keep working with no roster entry needed.
- If an ID-only code isn't found in the roster, the scan is flagged red and **not** recorded — add the person to the roster first, then re-scan.

## Roster CSV format

```csv
ID,Name
3018,"Limson, Haydee D"
1042,Juan Dela Cruz
```
Quote names that contain commas. The header is case-insensitive.

## Attendance CSV format

Each session export starts with an `Event/Subject/Section/Date/Time` header block (for your records), followed by the data rows in the format required by the spec:

```
ID, Name, Date, Time, Status
```
`Status` is always `Present` for a recorded row — duplicate scans of the same ID in a session are blocked before they're added.

## Drive / Sheets backup

Sign in under **Drive Backup** to opt in. Every successful scan rewrites that session's tab in the "RollCall Attendance" Google Sheet with the full up-to-date header block + roll (an atomic overwrite, not an incremental append — this avoids row-ordering races if multiple scans sync close together), and re-uploads the session's CSV snapshot to the "RollCall Attendance" Drive folder.

If a sync fails (e.g. offline), the session is marked unsynced in **Sessions** history; it retries automatically when the browser comes back online, or you can tap **Retry sync** manually. Scanning itself works fully offline — roster lookups and session storage live in IndexedDB.

## Testing

```bash
npm run build   # TypeScript + production build
npm run test    # vitest — covers QR parsing and CSV building/parsing logic
```

Camera scanning and the live Google sign-in/Drive/Sheets flows require a real browser + device and were verified manually, not by automated tests.

## Regenerating PWA icons

`public/icon.svg` is the source; `npm run generate-icons` rasterizes it to `pwa-192.png`, `pwa-512.png`, and `apple-touch-icon.png` via `scripts/generate-icons.mjs`.
