import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Kanban,
  GanttChart,
  Users,
  FolderOpen,
  Settings,
  Target,
} from 'lucide-react';
import { useSettingsStore } from '../../store';

const myLinks = [
  { to: '/my/day', label: 'My Day', icon: LayoutDashboard },
  { to: '/my/tasks', label: 'タスク一覧', icon: CalendarDays },
];

const teamLinks = [
  { to: '/team/board', label: 'かんばん', icon: Kanban },
  { to: '/team/timeline', label: 'タイムライン', icon: GanttChart },
  { to: '/team/members', label: 'メンバー別', icon: Users },
];

const commonLinks = [
  { to: '/projects', label: 'プロジェクト', icon: FolderOpen },
  { to: '/goals', label: '目標', icon: Target },
];

export function Sidebar() {
  const { appSettings, setView } = useSettingsStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary-100 text-primary-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">TaskFlow</h1>
      </div>

      {/* View Toggle */}
      <div className="px-4 py-3">
        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setView('my')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              appSettings.view === 'my'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My
          </button>
          <button
            onClick={() => setView('team')}
            className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              appSettings.view === 'team'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Team
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
        {appSettings.view === 'my' && (
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">My</p>
            {myLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        {appSettings.view === 'team' && (
          <div className="space-y-1">
            <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">Team</p>
            {teamLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                <link.icon className="w-5 h-5" />
                {link.label}
              </NavLink>
            ))}
          </div>
        )}

        <div className="mt-6 space-y-1">
          <p className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase">共通</p>
          {commonLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Settings */}
      <div className="px-3 py-3 border-t border-slate-200">
        <NavLink to="/settings" className={linkClass}>
          <Settings className="w-5 h-5" />
          設定
        </NavLink>
      </div>
    </aside>
  );
}
