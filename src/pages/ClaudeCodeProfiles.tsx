import { useTranslation } from 'react-i18next';
import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function ClaudeCodeProfiles() {
  const { t } = useTranslation();
  return (
    <TargetProfilesPage
      targetType="claude-code"
      description={t('defaults.claudeCodeDesc')}
    />
  );
}
