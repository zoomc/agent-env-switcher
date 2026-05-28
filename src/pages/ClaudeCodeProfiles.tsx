import { TargetProfilesPage } from '@/components/TargetProfilesPage';

export function ClaudeCodeProfiles() {
  return (
    <TargetProfilesPage
      targetType="claude-code"
      description="Anthropic's CLI — generates env var exports and ~/.claude/.env"
    />
  );
}
