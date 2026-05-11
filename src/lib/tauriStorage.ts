import { exists, mkdir, readTextFile, writeTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { appConfigDir } from '@tauri-apps/api/path';

const APP_DIR = 'agent-env-switcher';
const FILES = {
  profiles: 'profiles.json',
  activeProfileId: 'active-profile.json',
  settings: 'settings.json',
  backups: 'backups.json',
} as const;

async function ensureAppDir(): Promise<void> {
  const dir = await appConfigDir();
  const appDirPath = `${dir}${APP_DIR}`;
  const dirExists = await exists(appDirPath, { baseDir: BaseDirectory.AppConfig });
  if (!dirExists) {
    await mkdir(appDirPath, { baseDir: BaseDirectory.AppConfig, recursive: true });
  }
}

async function readFile(filename: string): Promise<string | null> {
  try {
    const dir = await appConfigDir();
    const filePath = `${dir}${APP_DIR}/${filename}`;
    const content = await readTextFile(filePath, { baseDir: BaseDirectory.AppConfig });
    return content;
  } catch {
    return null;
  }
}

async function writeFile(filename: string, content: string): Promise<void> {
  await ensureAppDir();
  const dir = await appConfigDir();
  const filePath = `${dir}${APP_DIR}/${filename}`;
  await writeTextFile(filePath, content, { baseDir: BaseDirectory.AppConfig });
}

export async function loadProfiles(): Promise<{ data: string | null; source: 'tauri' | null }> {
  const content = await readFile(FILES.profiles);
  return { data: content, source: content !== null ? 'tauri' : null };
}

export async function saveProfiles(profilesJson: string): Promise<void> {
  await writeFile(FILES.profiles, profilesJson);
}

export async function loadActiveProfileId(): Promise<string | null> {
  const content = await readFile(FILES.activeProfileId);
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    return typeof parsed === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveActiveProfileId(id: string | null): Promise<void> {
  if (id) {
    await writeFile(FILES.activeProfileId, JSON.stringify(id));
  } else {
    const dir = await appConfigDir();
    const filePath = `${dir}${APP_DIR}/${FILES.activeProfileId}`;
    try {
      await writeTextFile(filePath, '', { baseDir: BaseDirectory.AppConfig });
    } catch {
      /* ignore */
    }
  }
}

export async function loadSettings(): Promise<{ data: string | null; source: 'tauri' | null }> {
  const content = await readFile(FILES.settings);
  return { data: content, source: content !== null ? 'tauri' : null };
}

export async function saveSettings(settingsJson: string): Promise<void> {
  await writeFile(FILES.settings, settingsJson);
}

export async function loadBackups(): Promise<{ data: string | null; source: 'tauri' | null }> {
  const content = await readFile(FILES.backups);
  return { data: content, source: content !== null ? 'tauri' : null };
}

export async function saveBackups(backupsJson: string): Promise<void> {
  await writeFile(FILES.backups, backupsJson);
}

export async function exportToFile(json: string, filename: string): Promise<void> {
  await writeFile(filename, json);
}
