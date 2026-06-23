export interface SessionInfo {
  event: string;
  subject: string;
  section: string;
  date: string;
  time: string;
}

export interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  status: 'Present';
}

export interface SessionRecord {
  sessionId: string;
  info: SessionInfo;
  records: AttendanceRecord[];
  sheetsTabTitle: string | null;
  driveSynced: boolean;
  syncError: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface GoogleProfile {
  email: string;
  name?: string;
  picture?: string;
}
