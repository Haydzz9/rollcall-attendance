import { get, set } from 'idb-keyval';
import type { SessionRecord } from '../types';

const ROSTER_KEY = 'rollcall:roster';
const SESSIONS_KEY = 'rollcall:sessions';

export async function getRoster(): Promise<Record<string, string>> {
  return (await get(ROSTER_KEY)) ?? {};
}

export async function setRoster(roster: Record<string, string>): Promise<void> {
  await set(ROSTER_KEY, roster);
}

export async function getSessions(): Promise<SessionRecord[]> {
  return (await get(SESSIONS_KEY)) ?? [];
}

export async function saveSessions(sessions: SessionRecord[]): Promise<void> {
  await set(SESSIONS_KEY, sessions);
}
