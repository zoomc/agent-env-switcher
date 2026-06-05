import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';
import type { TargetId } from '@/lib/sidebarOrder';
import { HermesIcon } from '@/components/icons/HermesIcon';
import { ClaudeCodeIcon } from '@/components/icons/ClaudeCodeIcon';
import { CodexIcon } from '@/components/icons/CodexIcon';
import { OpenClawIcon } from '@/components/icons/OpenClawIcon';

const TARGET_ICONS: Record<TargetId, React.FC<React.SVGProps<SVGSVGElement>>> = {
  hermes: HermesIcon,
  'claude-code': ClaudeCodeIcon,
  codex: CodexIcon,
  openclaw: OpenClawIcon,
};

const TARGET_ROUTES: Record<TargetId, string> = {
  hermes: '/hermes',
  'claude-code': '/claude-code',
  codex: '/codex',
  openclaw: '/openclaw',
};

const TARGET_LABELS: Record<TargetId, string> = {
  hermes: 'sidebar.hermes',
  'claude-code': 'sidebar.claudeCode',
  codex: 'sidebar.codex',
  openclaw: 'sidebar.openclaw',
};

interface SortableTargetItemProps {
  id: TargetId;
}

export function SortableTargetItem({ id }: SortableTargetItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = TARGET_ICONS[id];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
        isDragging && 'z-50'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5 rounded hover:bg-accent"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <NavLink
        to={TARGET_ROUTES[id]}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-2 flex-1 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )
        }
      >
        <Icon className="h-4 w-4" />
        {t(TARGET_LABELS[id])}
      </NavLink>
    </div>
  );
}
