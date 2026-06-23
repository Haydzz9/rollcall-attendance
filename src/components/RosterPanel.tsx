import { useRef, useState } from 'react';
import { parseRosterCsv } from '../lib/csv';
import type { RosterEntry } from '../types';

interface Props {
  roster: Record<string, string>;
  onImport: (entries: RosterEntry[]) => void;
  onAdd: (id: string, name: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

export function RosterPanel({ roster, onImport, onAdd, onRename, onDelete }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');

  const entries = Object.entries(roster).sort((a, b) => a[1].localeCompare(b[1]));

  const handleFile = async (file: File) => {
    const text = await file.text();
    const { entries: parsed, skippedRows } = parseRosterCsv(text);
    onImport(parsed);
    setImportMsg(
      `Imported ${parsed.length} entr${parsed.length === 1 ? 'y' : 'ies'}` +
        (skippedRows > 0 ? ` (${skippedRows} row${skippedRows === 1 ? '' : 's'} skipped — missing ID or Name)` : '')
    );
  };

  const handleAdd = () => {
    const id = newId.trim();
    const name = newName.trim();
    if (!id || !name) return;
    onAdd(id, name);
    setNewId('');
    setNewName('');
  };

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Roster</h2>
        <span className="stamp">{entries.length} on file</span>
      </div>
      <div className="panel-body">
        <p className="drive-help">
          Upload a CSV with an <code>ID,Name</code> header to map scanned IDs to names, or add people manually below.
        </p>
        <div className="upload-row">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
        </div>
        {importMsg && <div className="drive-status-row">{importMsg}</div>}

        <div className="roster-add-row">
          <input placeholder="ID" value={newId} onChange={(e) => setNewId(e.target.value)} />
          <input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <button onClick={handleAdd}>Add</button>
        </div>

        {entries.length === 0 ? (
          <div className="empty-row" style={{ marginTop: 12 }}>
            No roster entries yet.
          </div>
        ) : (
          <table style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([id, name]) => (
                <tr key={id}>
                  <td className="t">{id}</td>
                  <td>
                    <input
                      style={{ border: 'none', background: 'transparent', font: 'inherit', width: '100%' }}
                      defaultValue={name}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && v !== name) onRename(id, v);
                      }}
                    />
                  </td>
                  <td className="del">
                    <button title="Remove" onClick={() => onDelete(id)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
