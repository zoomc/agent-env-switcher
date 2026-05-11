import type {
  Profile,
  TargetType,
  DryRunResult,
  DryRunChange,
  BackupRecord,
  HealthStatus,
} from '@/types';
import { RESTORE_SUPPORTED_TARGETS } from '@/types';
import { knownTargets } from '@/data/mock';
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { appConfigDir, homeDir } from '@tauri-apps/api/path';

export interface TargetAdapter {
  read(targetType: TargetType): Promise<string>;
  write(targetType: TargetType, profile: Profile): Promise<void>;
  backup(
    targetType: TargetType,
    profileId: string,
    profileName: string
  ): Promise<BackupRecord | null>;
  diff(targetType: TargetType, profile: Profile, currentContent: string): DryRunChange | null;
}

const TARGET_CONFIG_PATHS: Record<TargetType, string> = {
  'claude-code': '.claude/config.json',
  hermes: '.hermes/config.yaml',
  openclaw: '.openclaw/settings.json',
  'openai-compatible-api': 'Environment variables',
};

async function resolveHomePath(relativePath: string): Promise<string> {
  const home = await homeDir();
  return `${home}${relativePath}`;
}

async function readRawConfig(targetType: TargetType): Promise<string | null> {
  const path = TARGET_CONFIG_PATHS[targetType];
  if (path === 'Environment variables') {
    return JSON.stringify({});
  }
  const fullPath = await resolveHomePath(path);
  try {
    return await readTextFile(fullPath);
  } catch {
    return null;
  }
}

async function writeRawConfig(targetType: TargetType, content: string): Promise<void> {
  const path = TARGET_CONFIG_PATHS[targetType];
  if (path === 'Environment variables') {
    throw new Error('Writing environment variables is not supported');
  }
  const fullPath = await resolveHomePath(path);
  const dirPath = fullPath.split('/').slice(0, -1).join('/');
  const dirExists = await exists(dirPath);
  if (!dirExists) {
    await mkdir(dirPath, { recursive: true });
  }
  await writeTextFile(fullPath, content);
}

async function computeChecksum(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function createBackupRecord(
  targetType: TargetType,
  originalContent: string,
  profileId: string,
  profileName: string
): Promise<BackupRecord> {
  const appConfig = await appConfigDir();
  const backupDir = `${appConfig}agent-env-switcher/backups`;
  const dirExists = await exists(backupDir);
  if (!dirExists) {
    await mkdir(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `${targetType}-${timestamp}.bak`;
  const backupPath = `${backupDir}/${backupFileName}`;
  await writeTextFile(backupPath, originalContent);

  const checksum = await computeChecksum(originalContent);
  const target = knownTargets.find((t) => t.type === targetType);

  return {
    id: `backup-${targetType}-${Date.now()}`,
    targetType,
    targetName: target?.name || targetType,
    profileId,
    profileName,
    createdAt: new Date().toISOString(),
    originalConfigPath: TARGET_CONFIG_PATHS[targetType] || 'Unknown',
    backupFilePath: backupPath,
    backupFileSize: new Blob([originalContent]).size,
    restoreSupported: (RESTORE_SUPPORTED_TARGETS as readonly string[]).includes(targetType),
    checksum,
  };
}

function mergeJsonObject(
  existing: Record<string, unknown>,
  profileData: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    models: { default: string; fast: string; reasoning: string };
  }
): Record<string, unknown> {
  return {
    ...existing,
    provider: profileData.provider,
    baseUrl: profileData.baseUrl,
    apiKey: profileData.apiKey,
    models: {
      ...(typeof existing.models === 'object' && existing.models !== null ? existing.models : {}),
      default: profileData.models.default,
      fast: profileData.models.fast,
      reasoning: profileData.models.reasoning,
    },
  };
}

function formatConfigJson(
  targetType: TargetType,
  profile: Profile,
  currentContent: string
): string {
  let existing: Record<string, unknown> = {};
  if (currentContent.trim()) {
    try {
      existing = JSON.parse(currentContent);
    } catch {
      throw new Error(
        `${targetType} existing config is invalid JSON; cannot safely merge without overwriting`
      );
    }
  }
  const merged = mergeJsonObject(existing, {
    provider: profile.providerType,
    baseUrl: profile.baseUrl,
    apiKey: profile.apiKey,
    models: {
      default: profile.defaultModel,
      fast: profile.fastModel,
      reasoning: profile.reasoningModel,
    },
  });
  return JSON.stringify(merged, null, 2);
}

function formatConfigForDiff(
  targetType: TargetType,
  profile: Profile,
  currentContent: string
): string {
  if (targetType === 'claude-code' || targetType === 'openclaw') {
    try {
      return formatConfigJson(targetType, profile, currentContent);
    } catch {
      const existing = currentContent.trim() ? JSON.parse(currentContent) : {};
      return JSON.stringify(
        mergeJsonObject(existing, {
          provider: profile.providerType,
          baseUrl: profile.baseUrl,
          apiKey: profile.apiKey,
          models: {
            default: profile.defaultModel,
            fast: profile.fastModel,
            reasoning: profile.reasoningModel,
          },
        }),
        null,
        2
      );
    }
  }
  if (targetType === 'hermes') {
    return `provider: ${profile.providerType}
baseUrl: ${profile.baseUrl}
apiKey: ${profile.apiKey}
models:
  default: ${profile.defaultModel}
  fast: ${profile.fastModel}
  reasoning: ${profile.reasoningModel}
`;
  }
  if (targetType === 'openai-compatible-api') {
    return JSON.stringify(
      {
        OPENAI_API_KEY: profile.apiKey,
        OPENAI_API_BASE: profile.baseUrl,
        OPENAI_DEFAULT_MODEL: profile.defaultModel,
      },
      null,
      2
    );
  }
  return '';
}

function createDiff(
  targetType: TargetType,
  beforeContent: string,
  afterContent: string
): DryRunChange | null {
  if (beforeContent.trim() === afterContent.trim()) return null;
  return {
    file: TARGET_CONFIG_PATHS[targetType] || 'Unknown',
    action: beforeContent.trim() ? 'modify' : 'create',
    before: beforeContent,
    after: afterContent,
  };
}

export const targetAdapter: TargetAdapter = {
  async read(targetType: TargetType): Promise<string> {
    const raw = await readRawConfig(targetType);
    return raw || '';
  },

  async write(targetType: TargetType, profile: Profile): Promise<void> {
    if (targetType === 'hermes') {
      throw new Error('Hermes apply is not supported yet');
    }
    if (targetType === 'openai-compatible-api') {
      throw new Error('OpenAI-compatible API apply is not supported');
    }
    const currentContent = await this.read(targetType);
    const content = formatConfigJson(targetType, profile, currentContent);
    await writeRawConfig(targetType, content);
  },

  async backup(
    targetType: TargetType,
    profileId: string,
    profileName: string
  ): Promise<BackupRecord | null> {
    const raw = await readRawConfig(targetType);
    if (!raw) return null;
    return await createBackupRecord(targetType, raw, profileId, profileName);
  },

  diff(targetType: TargetType, profile: Profile, currentContent: string): DryRunChange | null {
    const after = formatConfigForDiff(targetType, profile, currentContent);
    return createDiff(targetType, currentContent, after);
  },
};

export async function generateDryRun(profile: Profile): Promise<DryRunResult[]> {
  const results: DryRunResult[] = [];
  for (const targetType of profile.enabledTargets) {
    const target = knownTargets.find((t) => t.type === targetType);
    let status: DryRunResult['status'] = 'pending';
    let changes: DryRunChange[] = [];

    try {
      const currentContent = await targetAdapter.read(targetType);
      const change = targetAdapter.diff(targetType, profile, currentContent);
      if (change) {
        changes = [change];
        status = 'ready';
      }
    } catch (err) {
      status = 'failed';
      changes = [
        {
          file: TARGET_CONFIG_PATHS[targetType] || 'Unknown',
          action: 'modify',
          before: '',
          after: `Error: ${err instanceof Error ? err.message : String(err)}`,
        },
      ];
    }

    results.push({
      id: `dryrun-${profile.id}-${targetType}-${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      targetType,
      targetName: target?.name || targetType,
      timestamp: new Date().toISOString(),
      changes,
      status,
    });
  }
  return results;
}

export async function applyProfile(profile: Profile): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  backupRecords: BackupRecord[];
  appliedTargets: TargetType[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const backupRecords: BackupRecord[] = [];
  const appliedTargets: TargetType[] = [];
  for (const targetType of profile.enabledTargets) {
    if (targetType === 'openai-compatible-api') {
      warnings.push(
        'OpenAI-compatible API config changes skipped (environment variable modification not supported)'
      );
      continue;
    }
    if (targetType === 'hermes') {
      warnings.push('Hermes config changes skipped (apply not supported yet)');
      continue;
    }
    try {
      const backup = await targetAdapter.backup(targetType, profile.id, profile.name);
      if (backup) backupRecords.push(backup);
      await targetAdapter.write(targetType, profile);
      appliedTargets.push(targetType);
    } catch (err) {
      errors.push(`${targetType}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return {
    success: errors.length === 0 && appliedTargets.length > 0,
    errors,
    warnings,
    backupRecords,
    appliedTargets,
  };
}

export async function restoreBackup(backupRecord: BackupRecord): Promise<{
  success: boolean;
  error?: string;
  preRestoreBackup?: BackupRecord;
}> {
  if (!backupRecord.restoreSupported) {
    return {
      success: false,
      error: `Restore not supported for target: ${backupRecord.targetType}`,
    };
  }

  const backupExists = await exists(backupRecord.backupFilePath);
  if (!backupExists) {
    return { success: false, error: `Backup file not found: ${backupRecord.backupFilePath}` };
  }

  let backupContent: string;
  try {
    backupContent = await readTextFile(backupRecord.backupFilePath);
  } catch {
    return { success: false, error: `Failed to read backup file: ${backupRecord.backupFilePath}` };
  }

  if (backupRecord.targetType === 'claude-code' || backupRecord.targetType === 'openclaw') {
    try {
      JSON.parse(backupContent);
    } catch {
      return { success: false, error: 'Backup content is invalid JSON; cannot safely restore' };
    }
  }

  let preRestoreBackup: BackupRecord | undefined;
  const currentContent = await readRawConfig(backupRecord.targetType);
  if (currentContent) {
    try {
      preRestoreBackup = await createBackupRecord(
        backupRecord.targetType,
        currentContent,
        backupRecord.profileId,
        backupRecord.profileName
      );
    } catch {
      return { success: false, error: 'Failed to create pre-restore backup; aborting restore' };
    }
  }

  try {
    await writeRawConfig(backupRecord.targetType, backupContent);
  } catch (err) {
    return {
      success: false,
      error: `Failed to write restored config: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  return { success: true, preRestoreBackup };
}

export async function previewRestore(backupRecord: BackupRecord): Promise<{
  canRestore: boolean;
  error?: string;
  diff: DryRunChange | null;
}> {
  if (!backupRecord.restoreSupported) {
    return {
      canRestore: false,
      error: `Restore not supported for target: ${backupRecord.targetType}`,
      diff: null,
    };
  }

  const backupExists = await exists(backupRecord.backupFilePath);
  if (!backupExists) {
    return {
      canRestore: false,
      error: `Backup file not found: ${backupRecord.backupFilePath}`,
      diff: null,
    };
  }

  let backupContent: string;
  try {
    backupContent = await readTextFile(backupRecord.backupFilePath);
  } catch {
    return { canRestore: false, error: `Failed to read backup file`, diff: null };
  }

  if (backupRecord.targetType === 'claude-code' || backupRecord.targetType === 'openclaw') {
    try {
      JSON.parse(backupContent);
    } catch {
      return {
        canRestore: false,
        error: 'Backup content is invalid JSON; cannot safely restore',
        diff: null,
      };
    }
  }

  const currentContent = await readRawConfig(backupRecord.targetType);
  const diff = createDiff(backupRecord.targetType, currentContent || '', backupContent);

  return { canRestore: true, diff };
}

export async function checkTargetHealth(targetType: TargetType): Promise<HealthStatus> {
  if (targetType === 'openai-compatible-api') {
    return 'unknown';
  }
  if (targetType === 'hermes') {
    const path = TARGET_CONFIG_PATHS[targetType];
    const fullPath = await resolveHomePath(path);
    const fileExists = await exists(fullPath);
    if (!fileExists) return 'unknown';
    return 'unknown';
  }

  const path = TARGET_CONFIG_PATHS[targetType];
  const fullPath = await resolveHomePath(path);
  const fileExists = await exists(fullPath);
  if (!fileExists) return 'unknown';

  try {
    const content = await readTextFile(fullPath);
    const parsed = JSON.parse(content);
    if (typeof parsed !== 'object' || parsed === null) return 'broken';
    if (!parsed.provider && !parsed.baseUrl && !parsed.apiKey) return 'warning';
    return 'healthy';
  } catch {
    return 'broken';
  }
}

export async function checkProfileHealth(profile: Profile): Promise<HealthStatus> {
  const targetHealths: HealthStatus[] = [];
  for (const targetType of profile.enabledTargets) {
    const health = await checkTargetHealth(targetType);
    targetHealths.push(health);
  }
  if (targetHealths.every((h) => h === 'healthy')) return 'healthy';
  if (targetHealths.some((h) => h === 'broken')) return 'broken';
  if (targetHealths.some((h) => h === 'warning')) return 'warning';
  return 'unknown';
}
