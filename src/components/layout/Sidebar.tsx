import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  Archive,
  Settings,
  Zap,
  Globe,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { SortableTargetList } from './SortableTargetList';

interface NavItem {
  to: string;
  labelKey: string;
  icon: LucideIcon;
}

const toolItems: NavItem[] = [
  { to: '/openrouter', labelKey: 'sidebar.openrouter', icon: Globe },
  { to: '/backups', labelKey: 'sidebar.backups', icon: Archive },
  { to: '/updates', labelKey: 'sidebar.updates', icon: RefreshCw },
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
        {/* Targets section with drag-and-drop */}
        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sidebar.targets')}
          </span>
        </div>
        <SortableTargetList />

        {/* Tools section */}
        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t('sidebar.tools')}
          </span>
        </div>
        {toolItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
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

        {/* Spacer */}
        <div className="pt-1" />

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            )
          }
        >
          <Settings className="h-4 w-4" />
          {t('sidebar.settings')}
        </NavLink>
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
