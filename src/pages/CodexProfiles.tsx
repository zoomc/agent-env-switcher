import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function CodexProfiles() {
  return (
    <TargetProfilesPage
      targetType="codex"
      description="OpenAI coding agent — manages ~/.codex/config.toml"
    />
  );
}
