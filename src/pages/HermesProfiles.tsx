import { useTranslation } from 'react-i18next';
import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function HermesProfiles() {
  const { t } = useTranslation();
  return (
    <TargetProfilesPage
      targetType="hermes"
      description={t('defaults.hermesDesc')}
    />
  );
}
