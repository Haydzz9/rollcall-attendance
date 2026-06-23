import { DRIVE_SCOPE, GOOGLE_CLIENT_ID, isGoogleConfigured } from '../config';
import { waitForGoogle } from './googleIdentity';
import type { GoogleTokenClient } from '../google';

let tokenClient: GoogleTokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry = 0;

export function initDriveAuth(onTokenChange: (connected: boolean) => void) {
  if (!isGoogleConfigured()) return;
  waitForGoogle(() => {
    tokenClient = window.google!.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error) {
          onTokenChange(false);
          return;
        }
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + resp.expires_in * 1000 - 60_000;
        onTokenChange(true);
      }
    });
  });
}

export function requestDriveAccess(forceConsent: boolean) {
  tokenClient?.requestAccessToken({ prompt: forceConsent ? 'consent' : '' });
}

export function disconnectDrive() {
  if (accessToken && typeof window.google !== 'undefined' && window.google.accounts) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenExpiry = 0;
}

export function isDriveConnected(): boolean {
  return Boolean(accessToken) && Date.now() < tokenExpiry;
}

export async function ensureFreshToken(): Promise<string | null> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;
  if (!tokenClient) return null;
  return new Promise((resolve) => {
    tokenClient!.callback = (resp) => {
      if (resp.error) {
        resolve(null);
        return;
      }
      accessToken = resp.access_token;
      tokenExpiry = Date.now() + resp.expires_in * 1000 - 60_000;
      resolve(accessToken);
    };
    tokenClient!.requestAccessToken({ prompt: '' });
  });
}
