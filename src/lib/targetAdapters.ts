import type { Profile, TargetType, DryRunResult, DryRunChange } from '@/types';
import { knownTargets } from '@/data/mock';
import { exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { appConfigDir, homeDir } from '@tauri-apps/api/path';

export interface TargetAdapter {
  read(targetType: TargetType): Promise<string>;
  write(targetType: TargetType, profile: Profile): Promise<void>;
  backup(targetType: TargetType): Promise<string>; // 返回备份路径
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

function formatConfig(targetType: TargetType, profile: Profile): string {
  switch (targetType) {
    case 'claude-code':
    case 'openclaw':
      return JSON.stringify(
        {
          provider: profile.providerType,
          baseUrl: profile.baseUrl,
          apiKey: profile.apiKey,
          models: {
            default: profile.defaultModel,
            fast: profile.fastModel,
            reasoning: profile.reasoningModel,
          },
        },
        null,
        2
      );
    case 'hermes':
      return `provider: ${profile.providerType}
baseUrl: ${profile.baseUrl}
apiKey: ${profile.apiKey}
models:
  default: ${profile.defaultModel}
  fast: ${profile.fastModel}
  reasoning: ${profile.reasoningModel}
`;
    case 'openai-compatible-api':
      return JSON.stringify(
        {
          OPENAI_API_KEY: profile.apiKey,
          OPENAI_API_BASE: profile.baseUrl,
          OPENAI_DEFAULT_MODEL: profile.defaultModel,
        },
        null,
        2
      );
    default:
      return '';
  }
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
    const content = formatConfig(targetType, profile);
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
    const after = formatConfig(targetType, profile);
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
  backupPaths: string[];
}> {
  const errors: string[] = [];
  const backupPaths: string[] = [];
  for (const targetType of profile.enabledTargets) {
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
    backupPaths,
  };
}
