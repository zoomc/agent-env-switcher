import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type {
  Profile,
  BackupRecord,
  AppSettings,
  DryRunResult,
  DryRunChange,
  HealthStatus,
  TargetProfile,
  TargetProfileStore,
  TargetType,
} from '@/types';
import * as tauriStorage from '@/lib/tauriStorage';
import * as localStorage from '@/lib/storage';
import {
  generateDryRun as generateRealDryRun,
  applyProfile,
  applyTargetProfile as doApplyTargetProfile,
  restoreBackup as doRestoreBackup,
  previewRestore as doPreviewRestore,
  checkProfileHealth,
} from '@/lib/targetAdapters';

interface RestorePreview {
  canRestore: boolean;
  error?: string;
  diff: DryRunChange | null;
}

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
  applyWarnings: string[];
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
  previewRestore: (backupRecord: BackupRecord) => Promise<RestorePreview>;
  restoreBackup: (backupRecord: BackupRecord) => Promise<{
    success: boolean;
    error?: string;
    preRestoreBackup?: BackupRecord;
  }>;
  refreshHealth: (profileId: string) => Promise<void>;
  targetProfiles: Record<TargetType, TargetProfile[]>;
  addTargetProfile: (targetType: TargetType, profile: Omit<TargetProfile, 'id' | 'targetType' | 'isActive' | 'lastApplied' | 'healthStatus'>) => void;
  updateTargetProfile: (targetType: TargetType, profileId: string, updates: Partial<TargetProfile>) => void;
  deleteTargetProfile: (targetType: TargetType, profileId: string) => void;
  switchActiveTargetProfile: (targetType: TargetType, profileId: string) => void;
  applyTargetProfileChanges: (profile: TargetProfile) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [settings, setSettings] = useState<AppSettings>(localStorage.loadSettings());
  const [targetProfileStore, setTargetProfileStore] = useState<TargetProfileStore>(
    localStorage.loadTargetProfiles()
  );

  const [dryRunResults, setDryRunResults] = useState<DryRunResult[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyWarnings, setApplyWarnings] = useState<string[]>([]);

  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const backupsRef = useRef(backups);
  backupsRef.current = backups;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const targetProfilesRef = useRef(targetProfileStore);
  targetProfilesRef.current = targetProfileStore;

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

  useEffect(() => {
    if (!isLoading) {
      localStorage.saveTargetProfiles(targetProfileStore);
    }
  }, [targetProfileStore, isLoading]);

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
    setApplyWarnings([]);
    try {
      const result = await applyProfile(profile);
      setApplyWarnings(result.warnings);
      if (result.backupRecords.length > 0) {
        setBackups((prev) => [...result.backupRecords, ...prev]);
      }
      if (result.success) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === profileId
              ? {
                  ...p,
                  lastApplied: new Date().toISOString(),
                  healthStatus: 'healthy' as HealthStatus,
                }
              : p
          )
        );
        setApplySuccess(true);
      } else if (result.errors.length > 0) {
        setApplyError(result.errors.join('; '));
      }
      setDryRunResults((prev) =>
        prev.map((r) => {
          if (r.profileId !== profileId) return r;
          if (r.status === 'pending') return r;
          if (result.appliedTargets.includes(r.targetType)) {
            return { ...r, status: 'applied' };
          }
          const hasErrorForTarget = result.errors.some((e) => e.startsWith(`${r.targetType}:`));
          if (hasErrorForTarget) {
            return { ...r, status: 'failed' };
          }
          return r;
        })
      );
      try {
        const health = await checkProfileHealth(profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === profileId ? { ...p, healthStatus: health } : p))
        );
      } catch {}
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsApplying(false);
    }
  }, []);

  const clearApplyState = useCallback(() => {
    setApplyError(null);
    setApplySuccess(false);
    setApplyWarnings([]);
  }, []);

  const previewRestoreFn = useCallback(
    async (backupRecord: BackupRecord): Promise<RestorePreview> => {
      return await doPreviewRestore(backupRecord);
    },
    []
  );

  const restoreBackupFn = useCallback(async (backupRecord: BackupRecord) => {
    const result = await doRestoreBackup(backupRecord);
    if (result.success && result.preRestoreBackup) {
      setBackups((prev) => [result.preRestoreBackup!, ...prev]);
    }
    return result;
  }, []);

  const refreshHealth = useCallback(async (profileId: string) => {
    const profile = profilesRef.current.find((p) => p.id === profileId);
    if (!profile) return;
    try {
      const health = await checkProfileHealth(profile);
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, healthStatus: health } : p))
      );
    } catch {}
  }, []);

  const targetProfiles = targetProfileStore.profiles;

  const addTargetProfile = useCallback(
    (
      targetType: TargetType,
      profile: Omit<TargetProfile, 'id' | 'targetType' | 'isActive' | 'lastApplied' | 'healthStatus'>
    ) => {
      const id = `tp-${targetType}-${Date.now()}`;
      const newProfile: TargetProfile = {
        ...profile,
        id,
        targetType,
        isActive: false,
        lastApplied: null,
        healthStatus: 'unknown',
      };
      setTargetProfileStore((prev) => localStorage.addTargetProfile(prev, newProfile));
    },
    []
  );

  const updateTargetProfile = useCallback(
    (targetType: TargetType, profileId: string, updates: Partial<TargetProfile>) => {
      setTargetProfileStore((prev) =>
        localStorage.updateTargetProfile(prev, targetType, profileId, updates)
      );
    },
    []
  );

  const deleteTargetProfile = useCallback((targetType: TargetType, profileId: string) => {
    setTargetProfileStore((prev) =>
      localStorage.deleteTargetProfile(prev, targetType, profileId)
    );
  }, []);

  const switchActiveTargetProfile = useCallback(
    (targetType: TargetType, profileId: string) => {
      setTargetProfileStore((prev) =>
        localStorage.switchActiveTargetProfile(prev, targetType, profileId)
      );
    },
    []
  );

  const applyTargetProfileChanges = useCallback(
    async (profile: TargetProfile): Promise<{ success: boolean; error?: string }> => {
      const result = await doApplyTargetProfile(profile);
      if (result.success) {
        setTargetProfileStore((prev) =>
          localStorage.updateTargetProfile(prev, profile.targetType, profile.id, {
            lastApplied: new Date().toISOString(),
            healthStatus: 'healthy',
          })
        );
        if (result.backupRecord) {
          setBackups((prev) => [result.backupRecord!, ...prev]);
        }
      }
      return result;
    },
    []
  );

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
        applyWarnings,
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
        previewRestore: previewRestoreFn,
        restoreBackup: restoreBackupFn,
        refreshHealth,
        targetProfiles,
        addTargetProfile,
        updateTargetProfile,
        deleteTargetProfile,
        switchActiveTargetProfile,
        applyTargetProfileChanges,
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
