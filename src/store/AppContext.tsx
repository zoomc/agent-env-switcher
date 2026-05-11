import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Profile, Backup, AppSettings, DryRunResult } from "@/types";
import { initialProfiles, initialBackups, initialSettings, generateDryRunPreview } from "@/data/mock";

interface AppContextValue {
  profiles: Profile[];
  backups: Backup[];
  settings: AppSettings;
  dryRunResults: DryRunResult[];
  activeProfile: Profile | undefined;
  switchProfile: (id: string) => void;
  addProfile: (profile: Omit<Profile, "id" | "isActive" | "lastApplied" | "healthStatus">) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  generateDryRun: (profileId: string) => void;
  addBackup: (profileId: string) => void;
  deleteBackup: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [backups, setBackups] = useState<Backup[]>(initialBackups);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [dryRunResults, setDryRunResults] = useState<DryRunResult[]>([]);

  const activeProfile = profiles.find((p) => p.isActive);

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
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return;
      const results = generateDryRunPreview(profile);
      setDryRunResults(results);
    },
    [profiles]
  );

  const addBackup = useCallback(
    (profileId: string) => {
      const profile = profiles.find((p) => p.id === profileId);
      if (!profile) return;
      const backup: Backup = {
        id: `backup-${Date.now()}`,
        profileId: profile.id,
        profileName: profile.name,
        timestamp: new Date().toISOString(),
        targetTypes: profile.enabledTargets,
        fileCount: profile.enabledTargets.length,
        size: `${(profile.enabledTargets.length * 0.8 + 0.5).toFixed(1)} KB`,
      };
      setBackups((prev) => [backup, ...prev]);
    },
    [profiles]
  );

  const deleteBackup = useCallback((id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <AppContext.Provider
      value={{
        profiles,
        backups,
        settings,
        dryRunResults,
        activeProfile,
        switchProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        duplicateProfile,
        updateSettings,
        generateDryRun,
        addBackup,
        deleteBackup,
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
