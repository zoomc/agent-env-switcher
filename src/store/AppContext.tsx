import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { Profile, BackupRecord, AppSettings, DryRunResult } from '@/types';
import * as tauriStorage from '@/lib/tauriStorage';
import * as localStorage from '@/lib/storage';
import { generateDryRun as generateRealDryRun, applyProfile } from '@/lib/targetAdapters';

interface AppContextValue {
  profiles: Profile[];
  backups: BackupRecord[];
  settings: AppSettings;
  dryRunResults: DryRunResult[];
  activeProfile: Profile | undefined;
  loadError: string | null;
  isLoading: boolean;
  isApplying: boolean;
  applyError: string | null;
  applySuccess: boolean;
  switchProfile: (id: string) => void;
  addProfile: (profile: Omit<Profile, 'id' | 'isActive' | 'lastApplied' | 'healthStatus'>) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  duplicateProfile: (id: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  generateDryRun: (profileId: string) => Promise<void>;
  deleteBackup: (id: string) => void;
  handleExport: () => string;
  handleImport: (jsonString: string) => { success: boolean; error?: string };
  importValidation: (jsonString: string) => {
    valid: boolean;
    error?: string;
    profileCount?: number;
    profileNames?: string[];
    hasApiKeys?: boolean;
  };
  applyChanges: (profileId: string) => Promise<void>;
  clearApplyState: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(localStorage.loadSettings());

  const [dryRunResults, setDryRunResults] = useState<DryRunResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const backupsRef = useRef(backups);
  backupsRef.current = backups;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    let cancelled = false;
    const errors: string[] = [];

    async function loadAll() {
      let loadedProfiles: Profile[] = [];
      const rawProfiles = await tauriStorage.loadProfiles();
      if (rawProfiles.data !== null) {
        try {
          const parsed = JSON.parse(rawProfiles.data) as Profile[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfiles(parsed);
            loadedProfiles = parsed;
          } else {
            const ls = localStorage.loadProfiles();
            setProfiles(ls);
            loadedProfiles = ls;
            errors.push('Tauri FS profiles empty, using localStorage');
          }
        } catch {
          const ls = localStorage.loadProfiles();
          setProfiles(ls);
          loadedProfiles = ls;
          errors.push('Tauri FS profiles parse failed, using localStorage');
        }
      } else {
        const ls = localStorage.loadProfiles();
        setProfiles(ls);
        loadedProfiles = ls;
        errors.push('No Tauri FS profiles found, using localStorage');
      }

      const rawSettings = await tauriStorage.loadSettings();
      if (!cancelled) {
        if (rawSettings.data !== null) {
          try {
            const parsed = JSON.parse(rawSettings.data) as AppSettings;
            setSettings(parsed);
          } catch {
            const ls = localStorage.loadSettings();
            setSettings(ls);
            errors.push('Tauri FS settings parse failed, using localStorage');
          }
        } else {
          const ls = localStorage.loadSettings();
          setSettings(ls);
        }
      }

      const rawBackups = await tauriStorage.loadBackups();
      if (!cancelled) {
        if (rawBackups.data !== null) {
          try {
            const parsed = JSON.parse(rawBackups.data) as BackupRecord[];
            setBackups(parsed);
          } catch {
            const ls = localStorage.loadBackups();
            setBackups(ls);
            errors.push('Tauri FS backups parse failed, using localStorage');
          }
        } else {
          const ls = localStorage.loadBackups();
          setBackups(ls);
        }
      }

      const savedId = await tauriStorage.loadActiveProfileId();
      if (!cancelled && savedId) {
        const exists = loadedProfiles.some((p) => p.id === savedId);
        if (exists) {
          setProfiles((prev) => prev.map((p) => ({ ...p, isActive: p.id === savedId })));
        }
      }

      if (!cancelled) {
        if (errors.length > 0) {
          setLoadError(errors.join('; '));
        }
        setIsLoading(false);
      }
    }

    loadAll().catch(() => {
      if (!cancelled) {
        setProfiles(localStorage.loadProfiles());
        setSettings(localStorage.loadSettings());
        setBackups(localStorage.loadBackups());
        setLoadError('Failed to load from Tauri FS, using defaults');
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const activeProfile = profiles.find((p) => p.isActive);

  useEffect(() => {
    if (!isLoading && profiles.length > 0) {
      tauriStorage.saveProfiles(JSON.stringify(profiles)).catch(() => {});
      localStorage.saveProfiles(profiles);
    }
  }, [profiles, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      tauriStorage.saveSettings(JSON.stringify(settings)).catch(() => {});
      localStorage.saveSettings(settings);
    }
  }, [settings, isLoading]);

  useEffect(() => {
    if (!isLoading && backups.length > 0) {
      tauriStorage.saveBackups(JSON.stringify(backups)).catch(() => {});
      localStorage.saveBackups(backups);
    }
  }, [backups, isLoading]);

  const switchProfile = useCallback((id: string) => {
    setProfiles((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === id,
        lastApplied: p.id === id ? new Date().toISOString() : p.lastApplied,
      }))
    );
    tauriStorage.saveActiveProfileId(id).catch(() => {});
    localStorage.saveActiveProfileId(id);
  }, []);

  const addProfile = useCallback(
    (profile: Omit<Profile, 'id' | 'isActive' | 'lastApplied' | 'healthStatus'>) => {
      const id = `profile-${Date.now()}`;
      const newProfile: Profile = {
        ...profile,
        id,
        isActive: false,
        lastApplied: null,
        healthStatus: 'unknown',
      };
      setProfiles((prev) => [...prev, newProfile]);
    },
    []
  );

  const updateProfile = useCallback((id: string, updates: Partial<Profile>) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deleteProfile = useCallback((id: string) => {
    setProfiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target?.isActive && prev.length > 1) {
        const remaining = prev.filter((p) => p.id !== id);
        const newActive = remaining[0];
        tauriStorage.saveActiveProfileId(newActive.id).catch(() => {});
        localStorage.saveActiveProfileId(newActive.id);
        return remaining.map((p, i) => (i === 0 ? { ...p, isActive: true } : p));
      }
      if (target?.isActive) {
        tauriStorage.saveActiveProfileId(null).catch(() => {});
        localStorage.saveActiveProfileId(null);
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

  const generateDryRun = useCallback(async (profileId: string) => {
    const profile = profilesRef.current.find((p) => p.id === profileId);
    if (!profile) return;
    try {
      const results = await generateRealDryRun(profile);
      setDryRunResults(results);
    } catch {
      setDryRunResults([]);
    }
  }, []);

  const deleteBackup = useCallback((id: string) => {
    setBackups((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleExport = useCallback(() => {
    return localStorage.exportProfiles(profilesRef.current);
  }, []);

  const importValidation = useCallback((jsonString: string) => {
    return localStorage.validateImport(jsonString);
  }, []);

  const handleImport = useCallback((jsonString: string) => {
    const validation = localStorage.validateImport(jsonString);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }
    try {
      const imported = localStorage.parseImport(jsonString);
      setProfiles(imported);
      tauriStorage.saveActiveProfileId(null).catch(() => {});
      localStorage.saveActiveProfileId(null);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to parse import data' };
    }
  }, []);

  const applyChanges = useCallback(async (profileId: string) => {
    const profile = profilesRef.current.find((p) => p.id === profileId);
    if (!profile) return;
    setIsApplying(true);
    setApplyError(null);
    setApplySuccess(false);
    try {
      const result = await applyProfile(profile);
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? { ...p, lastApplied: new Date().toISOString(), healthStatus: 'healthy' }
              : p
          )
        );
        setApplySuccess(true);
        setDryRunResults((prev) =>
          prev.map((r) => (r.profileId === profileId ? { ...r, status: 'applied' } : r))
        );
      } else {
        setApplyError(result.errors.join('; '));
        setDryRunResults((prev) =>
          prev.map((r) => (r.profileId === profileId ? { ...r, status: 'failed' } : r))
        );
      }
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsApplying(false);
    }
  }, []);

  const clearApplyState = useCallback(() => {
    setApplyError(null);
    setApplySuccess(false);
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
        isLoading,
        isApplying,
        applyError,
        applySuccess,
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
        applyChanges,
        clearApplyState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
