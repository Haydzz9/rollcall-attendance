import { GOOGLE_CLIENT_ID, isGoogleConfigured } from '../config';
import type { GoogleProfile } from '../types';

function decodeJwt(token: string): GoogleProfile | null {
  try {
    const payload = token.split('.')[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function waitForGoogle(onReady: () => void) {
  if (typeof window.google !== 'undefined' && window.google.accounts) {
    onReady();
    return;
  }
  setTimeout(() => waitForGoogle(onReady), 400);
}

export function initIdentity(onSignIn: (profile: GoogleProfile) => void, onError: () => void) {
  if (!isGoogleConfigured()) {
    onError();
    return;
  }
  waitForGoogle(() => {
    window.google!.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => {
        const profile = decodeJwt(resp.credential);
        if (!profile || !profile.email) {
          onError();
          return;
        }
        onSignIn(profile);
      },
      auto_select: false
    });
  });
}

export function renderSignInButton(el: HTMLElement) {
  waitForGoogle(() => {
    window.google!.accounts.id.renderButton(el, {
      theme: 'filled_black',
      size: 'large',
      text: 'signin_with',
      shape: 'pill'
    });
  });
}

export function signOutIdentity() {
  if (typeof window.google !== 'undefined' && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect();
  }
}
