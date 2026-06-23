import { describe, expect, it } from 'vitest';
import { buildAttendanceCsv, csvFilename } from '../csv';
import type { AttendanceRecord, SessionInfo } from '../../types';

describe('buildAttendanceCsv / csvFilename', () => {
  const info: SessionInfo = { event: 'Lecture', subject: 'CSCC 104', section: 'BSCS 2A', date: '2026-06-23', time: '08:00' };
  const records: AttendanceRecord[] = [
    { id: '3018', name: 'Limson, Haydee D', date: '2026-06-23', time: '08:01:02', status: 'Present' }
  ];

  it('includes the session header block and the ID,Name,Date,Time,Status columns', () => {
    const csv = buildAttendanceCsv(info, records);
    expect(csv).toContain('Event,Lecture');
    expect(csv).toContain('Subject,CSCC 104');
    expect(csv).toContain('ID,Name,Date,Time,Status');
    expect(csv).toContain('3018,"Limson, Haydee D",2026-06-23,08:01:02,Present');
  });

  it('builds a filesystem-safe filename from the session info', () => {
    expect(csvFilename(info)).toBe('attendance_CSCC-104_BSCS-2A_2026-06-23.csv');
  });
});
