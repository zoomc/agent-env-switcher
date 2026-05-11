import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import type { Profile, BackupRecord, AppSettings, DryRunResult } from "@/types";
import { generateDryRunPreview } from "@/data/mock";
import {
  loadProfiles,
  saveProfiles,
  loadSettings,
  saveSettings,
  loadBackups,
  saveBackups,
  exportProfiles,
  validateImport,
  parseImport,
} from "@/lib/storage";

interface AppContextValue {
  profiles: Profile[];
  backups: BackupRecord[];
  settings: AppSettings;
  dryRunResults: DryRunResult[];
  activeProfile: Profile | undefined;
  loadError: string | null;
  switchProfile: (id: string) => void;
  addProfile: (profile: Omit<Profile, "id" | "isActive" | "lastApplied" | "healthStatus">) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  generateDryRun: (profileId: string) => void;
  deleteBackup: (id: string) => void;
  handleExport: () => string;
  handleImport: (jsonString: string) => { success: boolean; error?: string };
  importValidation: (jsonString: string) => { valid: boolean; error?: string; profileCount?: number; profileNames?: string[]; hasApiKeys?: boolean };
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    try {
      return loadProfiles();
    } catch (e) {
      setLoadError("Failed to load saved profiles, using defaults");
      console.error(e);
      return [];
    }
  });
  const [backups, setBackups] = useState<BackupRecord[]>(() => loadBackups());
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings());
  const [dryRunResults, setDryRunResults] = useState<DryRunResult[]>([]);

  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const backupsRef = useRef(backups);
  backupsRef.current = backups;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const activeProfile = profiles.find((p) => p.isActive);

  useEffect(() => {
    saveProfiles(profiles);
  }, [profiles]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveBackups(backups);
  }, [backups]);

  const switchProfile = useCallback((id: string) => {
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === id,
        lastApplied: p.id === id ? new Date().toISOString() : p.lastApplied,
      }))
    );
  }, []);

  const addProfile = useCallback(
    (profile: Omit<Profile, "id" | "isActive" | "lastApplied" | "healthStatus">) => {
      const id = `profile-${Date.now()}`;
      const newProfile: Profile = {
        ...profile,
        id,
        isActive: false,
        lastApplied: null,
        healthStatus: "unknown",
      };
      setProfiles((prev) => [...prev, newProfile]);
    },
    []
  );

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.isActive && prev.length > 1) {
        return prev
          .filter((p) => p.id !== id)
          .map((p, i) => (i === 0 ? { ...p, isActive: true } : p));
      }
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const duplicateProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const source = prev.find((p) => p.id === id);
      if (!source) return prev;
      const newId = `profile-${Date.now()}`;
      const dup: Profile = {
        ...source,
        id: newId,
        name: `${source.name} (Copy)`,
        isActive: false,
        lastApplied: null,
      };
      return [...prev, dup];
    });
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const generateDryRun = useCallback(
    (profileId: string) => {
      const profile = profilesRef.current.find((p) => p.id === profileId);
      if (!profile) return;
      const results = generateDryRunPreview(profile);
      setDryRunResults(results);
    },
    []
  );

  const deleteBackup = useCallback((id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    return exportProfiles(profilesRef.current);
  }, []);

  const importValidation = useCallback((jsonString: string) => {
    return validateImport(jsonString);
  }, []);

  const handleImport = useCallback((jsonString: string) => {
    const validation = validateImport(jsonString);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    try {
      const imported = parseImport(jsonString);
      setProfiles(imported);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Failed to parse import data" };
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        profiles,
        backups,
        settings,
        dryRunResults,
        activeProfile,
        loadError,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        duplicateProfile,
        updateSettings,
        generateDryRun,
        deleteBackup,
        handleExport,
        handleImport,
        importValidation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
