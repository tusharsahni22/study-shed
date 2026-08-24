import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

function titleFor(path) {
  if (path === '/') return ['Dashboard', 'Your tuition centre at a glance'];
  if (path === '/students/new') return ['Enroll student', 'Register a new admission'];
  if (path.startsWith('/students/') && path.endsWith('/edit'))
    return ['Edit student', 'Update enrolment details'];
  if (path.startsWith('/students/')) return ['Student profile', 'Fees, subscription & payment history'];
  if (path === '/students') return ['Students', 'Everyone enrolled at your centre'];
  if (path === '/fees') return ['Classes & Fees', 'Class base fees and subject add-ons'];
  if (path === '/payments') return ['Payments', 'Your fee-collection ledger'];
  if (path === '/reminders') return ['Reminders', 'Nudge parents before a subscription lapses'];
  if (path === '/settings') return ['Settings', 'Institute, currency & messaging'];
  return ['Tution Management', ''];
}

export default function Topbar({ onMenu }) {
  const { pathname } = useLocation();
  const { settings } = useSettings();
  const [title, sub] = titleFor(pathname);

  return (
    <header className="topbar">
      <button className="hamburger" onClick={onMenu} aria-label="Toggle menu">
        <Menu size={20} />
      </button>
      <div>
        <h1>{title}</h1>
        <div className="topbar-sub">{sub}</div>
      </div>
      <div className="topbar-spacer" />
      <span className="chip">{settings.instituteName}</span>
    </header>
  );
}
