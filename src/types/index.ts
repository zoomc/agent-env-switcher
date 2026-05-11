export type ProviderType =
  | 'openai-compatible'
  | 'deepseek'
  | 'kimi'
  | 'openai'
  | 'gemini-compatible'
  | 'local-gateway'
  | 'openrouter';

export type TargetType = 'claude-code' | 'hermes' | 'openclaw' | 'openai-compatible-api';

export const VALID_PROVIDER_TYPES: readonly ProviderType[] = [
  'openai-compatible',
  'deepseek',
  'kimi',
  'openai',
  'gemini-compatible',
  'local-gateway',
  'openrouter',
];

export const VALID_TARGET_TYPES: readonly TargetType[] = [
  'claude-code',
  'hermes',
  'openclaw',
  'openai-compatible-api',
];

export const RESTORE_SUPPORTED_TARGETS: readonly TargetType[] = ['claude-code', 'openclaw'];

export type HealthStatus = 'healthy' | 'warning' | 'broken' | 'unknown';

export interface Profile {
  id: string;
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  defaultModel: string;
  fastModel: string;
  reasoningModel: string;
  apiKey: string;
  enabledTargets: TargetType[];
  lastApplied: string | null;
  healthStatus: HealthStatus;
  isActive: boolean;
}

export interface Target {
  id: string;
  type: TargetType;
  name: string;
  description: string;
  configPath: string;
  isAvailable: boolean;
}

export interface DryRunResult {
  id: string;
  profileId: string;
  profileName: string;
  targetType: TargetType;
  targetName: string;
  timestamp: string;
  changes: DryRunChange[];
  status: 'pending' | 'ready' | 'applied' | 'failed';
}

export interface DryRunChange {
  file: string;
  action: 'create' | 'modify' | 'delete';
  before: string;
  after: string;
}

export interface BackupRecord {
  id: string;
  targetType: TargetType;
  targetName: string;
  profileId: string;
  profileName: string;
  createdAt: string;
  originalConfigPath: string;
  backupFilePath: string;
  backupFileSize: number;
  restoreSupported: boolean;
  checksum: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  defaultProfileId: string | null;
  confirmBeforeApply: boolean;
  autoBackup: boolean;
  backupRetentionDays: number;
  advancedMode: boolean;
}

export interface ExportData {
  version: 1;
  exportedAt: string;
  profiles: Profile[];
}
