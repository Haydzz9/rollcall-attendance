import { describe, expect, it } from 'vitest';
import { buildAttendanceCsv, csvFilename, parseRosterCsv } from '../csv';
import type { AttendanceRecord, SessionInfo } from '../../types';

describe('parseRosterCsv', () => {
  it('parses ID,Name rows including names containing commas', () => {
    const csv = 'ID,Name\n3018,"Limson, Haydee D"\n42,Jane Doe\n';
    const { entries, skippedRows } = parseRosterCsv(csv);
    expect(entries).toEqual([
      { id: '3018', name: 'Limson, Haydee D' },
      { id: '42', name: 'Jane Doe' }
    ]);
    expect(skippedRows).toBe(0);
  });

  it('skips rows missing an ID or Name and is header case-insensitive', () => {
    const csv = 'id,name\n1,Alice\n,Bob\n2,\n';
    const { entries, skippedRows } = parseRosterCsv(csv);
    expect(entries).toEqual([{ id: '1', name: 'Alice' }]);
    expect(skippedRows).toBe(2);
  });
});

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
