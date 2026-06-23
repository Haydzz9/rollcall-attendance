import { useEffect, useRef } from 'react';
import { renderSignInButton } from '../lib/googleIdentity';

interface Props {
  configured: boolean;
  error: string | null;
}

export function AuthGate({ configured, error }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (configured && holderRef.current) {
      renderSignInButton(holderRef.current);
    }
  }, [configured]);

  return (
    <div className="auth-gate">
      <p className="gate-eyebrow">DMMMSU-SLUC · College of Computer Science</p>
      <h1>
        Roll<em>Call</em>
      </h1>
      <p className="gate-sub">sign in to access the attendance ledger</p>
      {configured ? (
        <div className="gsi-button-holder" ref={holderRef} />
      ) : (
        <div className="gate-msg denied">
          <b>Sign-in isn't configured</b>
          Set VITE_GOOGLE_CLIENT_ID in .env before this app can be used.
        </div>
      )}
      {error && <div className="gate-msg denied">{error}</div>}
      {!error && configured && (
        <div className="gate-msg">Sign in with your Google account to start scanning.</div>
      )}
    </div>
  );
}
