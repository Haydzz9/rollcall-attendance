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

let handlers = { onSignIn: (_p: GoogleProfile) => {}, onError: () => {} };
let initStarted = false;
let initDone = false;
let initWaiters: (() => void)[] = [];

/**
 * google.accounts.id.initialize() must complete before renderButton() is ever called,
 * or GIS throws "Failed to render button before calling initialize()". Both useAuth and
 * AuthGate want to kick this off independently (and React fires the child AuthGate's
 * effect before the parent's), so initialization is centralized and idempotent here —
 * whichever of initIdentity()/renderSignInButton() runs first starts it, and renderButton
 * always waits for it to actually finish first.
 */
function startInit() {
  if (initStarted || !isGoogleConfigured()) return;
  initStarted = true;
  waitForGoogle(() => {
    window.google!.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (resp) => {
        const profile = decodeJwt(resp.credential);
        if (!profile || !profile.email) {
          handlers.onError();
          return;
        }
        handlers.onSignIn(profile);
      },
      auto_select: false
    });
    initDone = true;
    initWaiters.forEach((run) => run());
    initWaiters = [];
  });
}

export function initIdentity(onSignIn: (profile: GoogleProfile) => void, onError: () => void) {
  handlers = { onSignIn, onError };
  startInit();
}

export function renderSignInButton(el: HTMLElement) {
  startInit();
  const render = () => {
    waitForGoogle(() => {
      window.google!.accounts.id.renderButton(el, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill'
      });
    });
  };
  if (initDone) render();
  else initWaiters.push(render);
}

export function signOutIdentity() {
  if (typeof window.google !== 'undefined' && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect();
  }
}
