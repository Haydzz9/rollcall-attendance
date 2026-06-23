import type { AttendanceRecord } from '../types';

interface Props {
  records: AttendanceRecord[];
  onRemove: (index: number) => void;
}

export function AttendanceRoll({ records, onRemove }: Props) {
  return (
    <div className="roll">
      <div className="roll-head">
        <h2>Attendance Roll</h2>
        <span className="count">{records.length} recorded</span>
      </div>
      {records.length === 0 ? (
        <div className="empty-row">No scans yet this session.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Time</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={`${r.id}-${i}`}>
                <td className="t">{r.id}</td>
                <td>{r.name}</td>
                <td className="t">{r.time}</td>
                <td className="del">
                  <button title="Remove" onClick={() => onRemove(i)}>
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
