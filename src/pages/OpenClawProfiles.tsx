import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function OpenClawProfiles() {
  return (
    <TargetProfilesPage
      targetType="openclaw"
      description="Open-source coding agent — manages ~/.openclaw/settings.json"
    />
  );
}
