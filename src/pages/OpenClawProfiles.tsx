import { useTranslation } from 'react-i18next';
import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function OpenClawProfiles() {
  const { t } = useTranslation();
  return (
    <TargetProfilesPage
      targetType="openclaw"
      description={t('defaults.openclawDesc')}
    />
  );
}
