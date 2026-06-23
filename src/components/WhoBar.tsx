import type { GoogleProfile } from '../types';

interface Props {
  profile: GoogleProfile;
  onSignOut: () => void;
}

export function WhoBar({ profile, onSignOut }: Props) {
  return (
    <div className="who-bar">
      <span className="who-email">{profile.email}</span>
      <button onClick={onSignOut}>Sign out</button>
    </div>
  );
}
