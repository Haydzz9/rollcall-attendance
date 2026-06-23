import { DRIVE_FOLDER_NAME } from '../config';

interface Props {
  configured: boolean;
  connected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  statusText: string | null;
  statusError: boolean;
}

export function DrivePanel({ configured, connected, onConnect, onDisconnect, statusText, statusError }: Props) {
  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Drive Backup</h2>
        <span className="stamp">{connected ? 'Connected' : 'Signed out'}</span>
      </div>
      <div className="panel-body">
        {!configured ? (
          <p className="drive-help">
            Drive backup needs a one-time setup step (Google Client ID not configured). Local export still works fine.
          </p>
        ) : (
          <p className="drive-help">
            {connected
              ? `Drive backup is on. Every scan saves a CSV to your "${DRIVE_FOLDER_NAME}" folder and a row to your "${DRIVE_FOLDER_NAME}" Google Sheet (new tab per session).`
              : 'Sign in once to auto-upload a CSV to your Google Drive and log each scan as a row in a Google Sheet.'}
          </p>
        )}
        {!connected ? (
          <button className="lock-btn" disabled={!configured} onClick={onConnect}>
            Sign in with Google
          </button>
        ) : (
          <button className="lock-btn danger" onClick={onDisconnect}>
            Sign out of Drive
          </button>
        )}
        {statusText && (
          <div className={`drive-status-row ${statusError ? 'err' : ''}`}>
            <span>{statusText}</span>
          </div>
        )}
      </div>
    </div>
  );
}
