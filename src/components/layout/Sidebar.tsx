import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  UserCircle,
  Target,
  Play,
  Archive,
  Settings,
  Zap,
  Bot,
  Terminal,
  Box,
  Bug,
  Globe,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface DividerItem {
  divider: true;
  label: string;
}

type SidebarItem = NavItem | DividerItem;

const navItems: SidebarItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { divider: true, label: 'Targets' },
  { to: '/hermes', label: 'Hermes', icon: Bot },
  { to: '/claude-code', label: 'Claude Code', icon: Terminal },
  { to: '/codex', label: 'Codex', icon: Box },
  { to: '/openclaw', label: 'OpenClaw', icon: Bug },
  { divider: true, label: 'Tools' },
  { to: '/openrouter', label: 'OpenRouter', icon: Globe },
  { to: '/profiles', label: 'Profiles', icon: UserCircle },
  { to: '/targets', label: 'Targets Info', icon: Target },
  { to: '/dry-run', label: 'Dry Run', icon: Play },
  { to: '/backups', label: 'Backups', icon: Archive },
  { divider: true, label: '' },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold">Agent Env Switcher</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item, idx) => {
          if ('divider' in item) {
            return item.label ? (
              <div key={`div-${idx}`} className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.label}
                </span>
              </div>
            ) : (
              <div key={`div-${idx}`} className="pt-1" />
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="text-xs text-muted-foreground">v0.1.0</p>
      </div>
    </aside>
  );
}
