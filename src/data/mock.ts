import type { Profile, Target, DryRunResult, BackupRecord, AppSettings, TargetType } from "@/types";

export const exampleProfiles: Profile[] = [
  {
    id: "profile-1",
    name: "DeepSeek Coding",
    providerType: "deepseek",
    baseUrl: "https://api.deepseek.com/v1",
    defaultModel: "deepseek-coder",
    fastModel: "deepseek-chat",
    reasoningModel: "deepseek-reasoner",
    apiKey: "MOCK_API_KEY_DEEPSEEK_DO_NOT_USE",
    enabledTargets: ["claude-code", "openclaw"],
    lastApplied: "2026-05-10T14:30:00Z",
    healthStatus: "healthy",
    isActive: true,
  },
  {
    id: "profile-2",
    name: "Kimi Fast",
    providerType: "kimi",
    baseUrl: "https://api.moonshot.cn/v1",
    defaultModel: "moonshot-v1-8k",
    fastModel: "moonshot-v1-8k",
    reasoningModel: "moonshot-v1-32k",
    apiKey: "MOCK_API_KEY_KIMI_DO_NOT_USE",
    enabledTargets: ["hermes"],
    lastApplied: "2026-05-09T10:00:00Z",
    healthStatus: "healthy",
    isActive: false,
  },
  {
    id: "profile-3",
    name: "OpenAI Main",
    providerType: "openai",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o",
    fastModel: "gpt-4o-mini",
    reasoningModel: "o1",
    apiKey: "MOCK_API_KEY_OPENAI_DO_NOT_USE",
    enabledTargets: ["claude-code", "hermes", "openclaw"],
    lastApplied: "2026-05-08T16:45:00Z",
    healthStatus: "degraded",
    isActive: false,
  },
  {
    id: "profile-4",
    name: "Local Gateway",
    providerType: "local-gateway",
    baseUrl: "http://localhost:8080/v1",
    defaultModel: "llama-3.3-70b",
    fastModel: "llama-3.1-8b",
    reasoningModel: "qwq-32b",
    apiKey: "MOCK_API_KEY_LOCAL_GATEWAY_DO_NOT_USE",
    enabledTargets: ["claude-code", "openai-compatible-api"],
    lastApplied: null,
    healthStatus: "offline",
    isActive: false,
  },
  {
    id: "profile-5",
    name: "OpenRouter Backup",
    providerType: "openrouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "anthropic/claude-sonnet-4",
    fastModel: "google/gemini-2.0-flash",
    reasoningModel: "openai/o3",
    apiKey: "MOCK_API_KEY_OPENROUTER_DO_NOT_USE",
    enabledTargets: ["claude-code", "hermes"],
    lastApplied: "2026-05-07T09:15:00Z",
    healthStatus: "healthy",
    isActive: false,
  },
];

export const knownTargets: Target[] = [
  {
    id: "target-1",
    type: "claude-code",
    name: "Claude Code",
    description: "Anthropic's CLI coding agent",
    configPath: "~/.claude/config.json",
    isAvailable: true,
  },
  {
    id: "target-2",
    type: "hermes",
    name: "Hermes",
    description: "AI coding assistant",
    configPath: "~/.hermes/config.yaml",
    isAvailable: true,
  },
  {
    id: "target-3",
    type: "openclaw",
    name: "OpenClaw",
    description: "Open-source coding agent",
    configPath: "~/.openclaw/settings.json",
    isAvailable: false,
  },
  {
    id: "target-4",
    type: "openai-compatible-api",
    name: "OpenAI-Compatible API",
    description: "Any OpenAI-compatible API endpoint",
    configPath: "Environment variables",
    isAvailable: true,
  },
];

export const exampleBackups: BackupRecord[] = [
  {
    id: "backup-1",
    profileId: "profile-3",
    profileName: "OpenAI Main",
    timestamp: "2026-05-08T16:45:00Z",
    targetTypes: ["claude-code", "hermes", "openclaw"],
    fileCount: 3,
    size: "2.4 KB",
  },
  {
    id: "backup-2",
    profileId: "profile-1",
    profileName: "DeepSeek Coding",
    timestamp: "2026-05-10T14:30:00Z",
    targetTypes: ["claude-code", "openclaw"],
    fileCount: 2,
    size: "1.8 KB",
  },
  {
    id: "backup-3",
    profileId: "profile-5",
    profileName: "OpenRouter Backup",
    timestamp: "2026-05-07T09:15:00Z",
    targetTypes: ["claude-code", "hermes"],
    fileCount: 2,
    size: "1.6 KB",
  },
];

export const defaultSettings: AppSettings = {
  theme: "dark",
  defaultProfileId: "profile-1",
  confirmBeforeApply: true,
  autoBackup: true,
  backupRetentionDays: 30,
  advancedMode: false,
};

const targetConfigPaths: Record<TargetType, string> = {
  "claude-code": "~/.claude/config.json",
  "hermes": "~/.hermes/config.yaml",
  "openclaw": "~/.openclaw/settings.json",
  "openai-compatible-api": "Environment variables",
};

export function generateDryRunPreview(profile: Profile): DryRunResult[] {
  return profile.enabledTargets.map((targetType, idx) => ({
    id: `dryrun-${profile.id}-${idx}`,
    profileId: profile.id,
    profileName: profile.name,
    targetType,
    targetName: knownTargets.find((t) => t.type === targetType)?.name ?? targetType,
    timestamp: new Date().toISOString(),
    changes: [
      {
        file: targetConfigPaths[targetType] ?? "Unknown",
        action: "modify" as const,
        before: `{\n  "provider": "previous",\n  "model": "previous-model"\n}`,
        after: `{\n  "provider": "${profile.providerType}",\n  "model": "${profile.defaultModel}"\n}`,
      },
    ],
    status: "ready" as const,
  }));
}
