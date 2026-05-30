import { useTranslation } from 'react-i18next';
import { TargetProfilesPage } from '@/components/TargetProfilesPage';
import { CodexAuthBackup } from '@/components/CodexAuthBackup';

export function CodexProfiles() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <CodexAuthBackup />
      <TargetProfilesPage
        targetType="codex"
        description={t('defaults.codexDesc')}
      />
    </div>
  );
}
