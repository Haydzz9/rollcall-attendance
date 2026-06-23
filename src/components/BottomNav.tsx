export type Tab = 'scan' | 'roster' | 'sessions';

const TABS: { id: Tab; label: string }[] = [
  { id: 'scan', label: 'Scan' },
  { id: 'roster', label: 'Roster' },
  { id: 'sessions', label: 'Sessions' }
];

interface Props {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => (
        <button key={tab.id} className={active === tab.id ? 'active' : ''} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
