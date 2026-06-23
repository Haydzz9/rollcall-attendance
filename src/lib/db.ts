import { get, set } from 'idb-keyval';
import type { SessionRecord } from '../types';

const SESSIONS_KEY = 'rollcall:sessions';

export async function getSessions(): Promise<SessionRecord[]> {
  return (await get(SESSIONS_KEY)) ?? [];
}

export async function saveSessions(sessions: SessionRecord[]): Promise<void> {
  await set(SESSIONS_KEY, sessions);
}
