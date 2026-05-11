import type { Profile, BackupRecord, AppSettings, ExportData } from "@/types";
import { VALID_PROVIDER_TYPES, VALID_TARGET_TYPES } from "@/types";
import { exampleProfiles, exampleBackups, defaultSettings } from "@/data/mock";

const KEYS = {
  profiles: "agent-env-switcher:profiles",
  activeProfileId: "agent-env-switcher:active-profile-id",
  settings: "agent-env-switcher:settings",
  backups: "agent-env-switcher:backups",
} as const;

function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export function loadProfiles(): Profile[] {
  const raw = localStorage.getItem(KEYS.profiles);
  if (!raw) return exampleProfiles;
  const parsed = safeParse<Profile[]>(raw, exampleProfiles);
  if (!Array.isArray(parsed) || parsed.length === 0) return exampleProfiles;
  return parsed;
}

export function saveProfiles(profiles: Profile[]): void {
  try {
    localStorage.setItem(KEYS.profiles, JSON.stringify(profiles));
  } catch (e) {
    console.error("Failed to save profiles to localStorage:", e);
  }
}

export function loadActiveProfileId(): string | null {
  const raw = localStorage.getItem(KEYS.activeProfileId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? parsed : null;
  } catch {
    return null;
  }
}

export function saveActiveProfileId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(KEYS.activeProfileId, JSON.stringify(id));
    } else {
      localStorage.removeItem(KEYS.activeProfileId);
    }
  } catch (e) {
    console.error("Failed to save activeProfileId to localStorage:", e);
  }
}

export function loadSettings(): AppSettings {
  const raw = localStorage.getItem(KEYS.settings);
  if (!raw) return defaultSettings;
  return safeParse<AppSettings>(raw, defaultSettings);
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings to localStorage:", e);
  }
}

export function loadBackups(): BackupRecord[] {
  const raw = localStorage.getItem(KEYS.backups);
  if (!raw) return exampleBackups;
  return safeParse<BackupRecord[]>(raw, exampleBackups);
}

export function saveBackups(backups: BackupRecord[]): void {
  try {
    localStorage.setItem(KEYS.backups, JSON.stringify(backups));
  } catch (e) {
    console.error("Failed to save backups to localStorage:", e);
  }
}

export function exportProfiles(profiles: Profile[]): string {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profiles,
  };
  return JSON.stringify(data, null, 2);
}

export interface ImportValidation {
  valid: boolean;
  error?: string;
  profileCount?: number;
  profileNames?: string[];
  hasApiKeys?: boolean;
}

export function validateImport(jsonString: string): ImportValidation {
  let data: unknown;
  try {
    data = JSON.parse(jsonString);
  } catch {
    return { valid: false, error: "Invalid JSON format" };
  }

  if (!data || typeof data !== "object") {
    return { valid: false, error: "Import data must be an object" };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.profiles)) {
    return { valid: false, error: "Import data must contain a 'profiles' array" };
  }

  const profiles = obj.profiles as Profile[];

  if (profiles.length === 0) {
    return { valid: false, error: "Profiles array is empty" };
  }

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];

    if (!p.name || typeof p.name !== "string") {
      return { valid: false, error: `Profile at index ${i} is missing a valid 'name'` };
    }

    if (!p.providerType || typeof p.providerType !== "string") {
      return { valid: false, error: `Profile "${p.name}" is missing a valid 'providerType'` };
    }

    if (!VALID_PROVIDER_TYPES.includes(p.providerType as Profile["providerType"])) {
      return {
        valid: false,
        error: `Profile "${p.name}" has invalid providerType "${p.providerType}". Valid values: ${VALID_PROVIDER_TYPES.join(", ")}`,
      };
    }

    if (!p.baseUrl || typeof p.baseUrl !== "string") {
      return { valid: false, error: `Profile "${p.name}" is missing a valid 'baseUrl'` };
    }

    if (typeof p.apiKey !== "string") {
      return { valid: false, error: `Profile "${p.name}" has an invalid 'apiKey' (must be a string)` };
    }

    if (typeof p.defaultModel !== "string") {
      return { valid: false, error: `Profile "${p.name}" has an invalid 'defaultModel' (must be a string)` };
    }

    if (typeof p.fastModel !== "string") {
      return { valid: false, error: `Profile "${p.name}" has an invalid 'fastModel' (must be a string)` };
    }

    if (typeof p.reasoningModel !== "string") {
      return { valid: false, error: `Profile "${p.name}" has an invalid 'reasoningModel' (must be a string)` };
    }

    if (!Array.isArray(p.enabledTargets)) {
      return { valid: false, error: `Profile "${p.name}" has an invalid 'enabledTargets' (must be an array)` };
    }

    for (const t of p.enabledTargets) {
      if (!VALID_TARGET_TYPES.includes(t as Profile["enabledTargets"][number])) {
        return {
          valid: false,
          error: `Profile "${p.name}" has invalid target "${t}" in enabledTargets. Valid values: ${VALID_TARGET_TYPES.join(", ")}`,
        };
      }
    }
  }

  const hasApiKeys = profiles.some(
    (p) => p.apiKey && p.apiKey !== "" && !p.apiKey.startsWith("MOCK_API_KEY_")
  );

  return {
    valid: true,
    profileCount: profiles.length,
    profileNames: profiles.map((p) => p.name),
    hasApiKeys,
  };
}

export function parseImport(jsonString: string): Profile[] {
  const data = JSON.parse(jsonString) as ExportData;
  return data.profiles.map((p) => ({
    ...p,
    id: p.id || `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    isActive: false,
  }));
}
