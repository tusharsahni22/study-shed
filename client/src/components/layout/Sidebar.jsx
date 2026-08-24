import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Wallet,
  BellRing,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext.jsx';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/fees', label: 'Classes & Fees', icon: GraduationCap },
  { to: '/payments', label: 'Payments', icon: Wallet },
  { to: '/reminders', label: 'Reminders', icon: BellRing },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar({ open }) {
  const { settings } = useSettings();

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark">
          <GraduationCap size={22} />
        </div>
        <div>
          <div className="brand-name">Tution Management</div>
          <div className="brand-sub">Fees &amp; subscriptions</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Menu</div>
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <n.icon size={18} />
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-spacer" />

      <div className="sidebar-foot">
        <div style={{ color: 'var(--text-dim)', fontWeight: 600, marginBottom: 2 }}>
          {settings.instituteName}
        </div>
        Subscription-aware fee console
        <div style={{ marginTop: 8, opacity: 0.7 }}>© Tushar 2026</div>
      </div>
    </aside>
  );
}
