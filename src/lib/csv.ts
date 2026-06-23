import type { AttendanceRecord, SessionInfo } from '../types';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return '"' + value.replace(/"/g, '""') + '"';
  return value;
}

export function buildAttendanceCsv(info: SessionInfo, records: AttendanceRecord[]): string {
  const headerRows: [string, string][] = [
    ['Event', info.event],
    ['Subject', info.subject],
    ['Section', info.section],
    ['Date', info.date],
    ['Time', info.time]
  ];
  const cols = ['ID', 'Name', 'Date', 'Time', 'Status'];
  const rows = records.map((r) => [r.id, r.name, r.date, r.time, r.status]);

  let csv = headerRows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n\n';
  csv += cols.map(csvEscape).join(',') + '\n';
  csv += rows.map((r) => r.map(csvEscape).join(',')).join('\n');
  if (rows.length > 0) csv += '\n';
  return csv;
}

export function csvFilename(info: SessionInfo): string {
  const safe = (str: string) => (str || 'session').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return `attendance_${safe(info.subject)}_${safe(info.section)}_${info.date || 'date'}.csv`;
}

export function downloadSessionCsv(info: SessionInfo, records: AttendanceRecord[]): void {
  const blob = new Blob([buildAttendanceCsv(info, records)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = csvFilename(info);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
