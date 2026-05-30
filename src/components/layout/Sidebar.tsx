import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

interface DividerItem {
  divider: true;
  labelKey: string;
}

type SidebarItem = NavItem | DividerItem;

const navItems: SidebarItem[] = [
  { to: '/', labelKey: 'sidebar.dashboard', icon: LayoutDashboard },
  { divider: true, labelKey: 'sidebar.targets' },
  { to: '/hermes', labelKey: 'sidebar.hermes', icon: Bot },
  { to: '/claude-code', labelKey: 'sidebar.claudeCode', icon: Terminal },
  { to: '/codex', labelKey: 'sidebar.codex', icon: Box },
  { to: '/openclaw', labelKey: 'sidebar.openclaw', icon: Bug },
  { divider: true, labelKey: 'sidebar.tools' },
  { to: '/openrouter', labelKey: 'sidebar.openrouter', icon: Globe },
  { to: '/profiles', labelKey: 'sidebar.profiles', icon: UserCircle },
  { to: '/targets', labelKey: 'sidebar.targetsInfo', icon: Target },
  { to: '/dry-run', labelKey: 'sidebar.dryRun', icon: Play },
  { to: '/backups', labelKey: 'sidebar.backups', icon: Archive },
  { to: '/updates', labelKey: 'sidebar.updates', icon: RefreshCw },
  { divider: true, labelKey: '' },
  { to: '/settings', labelKey: 'sidebar.settings', icon: Settings },
];

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en');

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-sm font-semibold">{t('app.name')}</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {navItems.map((item, idx) => {
          if ('divider' in item) {
            return item.labelKey ? (
              <div key={`div-${idx}`} className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {t(item.labelKey)}
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
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{t('app.version')}</p>
          <button
            onClick={toggleLang}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5 py-0.5 rounded hover:bg-accent"
            title="Toggle language"
          >
            {i18n.language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </div>
    </aside>
  );
}
