import type { SessionInfo } from '../types';

interface Props {
  info: SessionInfo;
  locked: boolean;
  onChange: (info: SessionInfo) => void;
  onLockToggle: () => void;
}

export function SessionPanel({ info, locked, onChange, onLockToggle }: Props) {
  const set = (patch: Partial<SessionInfo>) => onChange({ ...info, ...patch });

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Session</h2>
        <span className="stamp">{locked ? 'Locked' : 'Unlocked'}</span>
      </div>
      <div className="panel-body">
        <div className="field">
          <label htmlFor="f-event">Event / Activity</label>
          <input
            id="f-event"
            type="text"
            placeholder="e.g. Lecture, Seminar, Org Meeting"
            value={info.event}
            disabled={locked}
            onChange={(e) => set({ event: e.target.value })}
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-subject">Subject</label>
            <input
              id="f-subject"
              type="text"
              placeholder="e.g. CSCC 104"
              value={info.subject}
              disabled={locked}
              onChange={(e) => set({ subject: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="f-section">Section</label>
            <input
              id="f-section"
              type="text"
              placeholder="e.g. BSCS 2A"
              value={info.section}
              disabled={locked}
              onChange={(e) => set({ section: e.target.value })}
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="f-date">Date</label>
            <input
              id="f-date"
              type="date"
              value={info.date}
              disabled={locked}
              onChange={(e) => set({ date: e.target.value })}
            />
          </div>
          <div className="field">
            <label htmlFor="f-time">Time</label>
            <input
              id="f-time"
              type="time"
              value={info.time}
              disabled={locked}
              onChange={(e) => set({ time: e.target.value })}
            />
          </div>
        </div>
        <button className={`lock-btn ${locked ? 'locked' : ''}`} onClick={onLockToggle}>
          {locked ? 'Unlock & edit session details' : 'Lock session & start scanning'}
        </button>
        {locked && (
          <div className="session-summary">
            <b>{info.event || '—'}</b> · {info.subject || '—'} · {info.section || '—'}
            <br />
            {info.date} {info.time}
          </div>
        )}
      </div>
    </div>
  );
}
