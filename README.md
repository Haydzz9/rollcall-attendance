# RollCall — QR Attendance (version 2)

**Programmer:** Haydee Dulay-Limson

React/TypeScript/PWA rewrite of the `attendance/attendance-scanner.html` prototype. Same Google account, Drive folder ("RollCall Attendance") and Google Sheet, rebuilt with offline-safe session history and installable PWA support. No backend — runs entirely in the browser.

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

Each QR code must encode `<ID>/<Name>` directly, e.g. `3018/Limson, Haydee D` — matching the original prototype's printed ID cards. A code with no `/` (or that looks like a URL, e.g. a test QR from a generator site) is rejected as unrecognized and not recorded.

## Attendance CSV format

Each session export starts with an `Event/Subject/Section/Date/Time` header block (for your records), followed by the data rows in the format required by the spec:

```
ID, Name, Date, Time, Status
```
`Status` is always `Present` for a recorded row — duplicate scans of the same ID in a session are blocked before they're added.

## Drive / Sheets backup

Sign in under **Drive Backup** to opt in. Every successful scan rewrites that session's tab in the "RollCall Attendance" Google Sheet with the full up-to-date header block + roll (an atomic overwrite, not an incremental append — this avoids row-ordering races if multiple scans sync close together), and re-uploads the session's CSV snapshot to the "RollCall Attendance" Drive folder.

If a sync fails (e.g. offline), the session is marked unsynced in **Sessions** history; it retries automatically when the browser comes back online, or you can tap **Retry sync** manually. Scanning itself works fully offline — session storage lives in IndexedDB.

## Testing

```bash
npm run build   # TypeScript + production build
npm run test    # vitest — covers QR parsing and CSV building/parsing logic
```

Camera scanning and the live Google sign-in/Drive/Sheets flows require a real browser + device and were verified manually, not by automated tests.

## Regenerating PWA icons

`public/icon.svg` is the source; `npm run generate-icons` rasterizes it to `pwa-192.png`, `pwa-512.png`, and `apple-touch-icon.png` via `scripts/generate-icons.mjs`.
