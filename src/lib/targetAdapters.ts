import type { Profile, TargetType, DryRunResult, DryRunChange } from '@/types';
import { knownTargets } from '@/data/mock';
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { appConfigDir, homeDir } from '@tauri-apps/api/path';

export interface TargetAdapter {
  read(targetType: TargetType): Promise<string>;
  write(targetType: TargetType, profile: Profile): Promise<void>;
  backup(targetType: TargetType): Promise<string>;
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

async function createBackup(targetType: TargetType, originalContent: string): Promise<string> {
  const appConfig = await appConfigDir();
  const backupDir = `${appConfig}agent-env-switcher/backups`;
  const dirExists = await exists(backupDir);
  if (!dirExists) {
    await mkdir(backupDir, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${backupDir}/${targetType}-${timestamp}.bak`;
  await writeTextFile(backupPath, originalContent);
  return backupPath;
}

function mergeJsonObject(
  existing: Record<string, unknown>,
  profileData: {
    provider: string;
    baseUrl: string;
    apiKey: string;
    models: {
      default: string;
      fast: string;
      reasoning: string;
    };
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
    } catch (e) {
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

  async backup(targetType: TargetType): Promise<string> {
    const raw = await readRawConfig(targetType);
    if (!raw) {
      return '';
    }
    return await createBackup(targetType, raw);
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
    const currentContent = await targetAdapter.read(targetType);
    const change = targetAdapter.diff(targetType, profile, currentContent);
    results.push({
      id: `dryrun-${profile.id}-${targetType}-${Date.now()}`,
      profileId: profile.id,
      profileName: profile.name,
      targetType,
      targetName: target?.name || targetType,
      timestamp: new Date().toISOString(),
      changes: change ? [change] : [],
      status: change ? 'ready' : 'pending',
    });
  }
  return results;
}

export async function applyProfile(profile: Profile): Promise<{
  success: boolean;
  errors: string[];
  warnings: string[];
  backupPaths: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const backupPaths: string[] = [];
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
      const backup = await targetAdapter.backup(targetType);
      if (backup) backupPaths.push(backup);
      await targetAdapter.write(targetType, profile);
    } catch (err) {
      errors.push(`${targetType}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return {
    success: errors.length === 0,
    errors,
    warnings,
    backupPaths,
  };
}
