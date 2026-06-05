import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ProfileEditor } from '@/components/ProfileEditor';
import { DefaultModelSection } from '@/components/DefaultModelSection';
import { maskApiKey } from '@/lib/mask';
import { useApp } from '@/store/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowRightLeft,
  Play,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { TargetType, TargetProfile, HealthStatus } from '@/types';
import { TARGET_CONFIG_PATHS, TARGET_LABELS } from '@/types';

const healthIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  broken: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

interface TargetProfilesPageProps {
  targetType: TargetType;
  description: string;
}

export function TargetProfilesPage({ targetType, description }: TargetProfilesPageProps) {
  const {
    targetProfiles,
    addTargetProfile,
    updateTargetProfile,
    deleteTargetProfile,
    switchActiveTargetProfile,
    applyTargetProfileChanges,
  } = useApp();
  const { t } = useTranslation();

  const profiles = targetProfiles[targetType] || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<{
    profileId: string;
    success: boolean;
    message: string;
  } | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null);
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewProfile = (
    data: Omit<TargetProfile, 'id' | 'targetType' | 'isActive' | 'lastApplied' | 'healthStatus'>
  ) => {
    addTargetProfile(targetType, data);
    setShowNewForm(false);
  };

  const handleEditProfile = (
    id: string,
    data: Omit<TargetProfile, 'id' | 'targetType' | 'isActive' | 'lastApplied' | 'healthStatus'>
  ) => {
    updateTargetProfile(targetType, id, data);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteTargetProfile(targetType, id);
    setConfirmDeleteId(null);
    setExpandedId(null);
  };

  const handleApply = async (profile: TargetProfile) => {
    setApplyingId(profile.id);
    setApplyResult(null);
    try {
      const result = await applyTargetProfileChanges(profile);
      setApplyResult({
        profileId: profile.id,
        success: result.success,
        message: result.success
          ? `Applied to ${TARGET_CONFIG_PATHS[targetType]}`
          : result.error || 'Apply failed',
      });
    } catch (err) {
      setApplyResult({
        profileId: profile.id,
        success: false,
        message: err instanceof Error ? err.message : 'Apply failed',
      });
    } finally {
      setApplyingId(null);
    }
  };

  const handleSwitch = (id: string) => {
    switchActiveTargetProfile(targetType, id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{TARGET_LABELS[targetType]}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          {t('targetProfiles.newProfile')}
        </Button>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
        <span className="text-xs text-blue-200">
          {t('targetProfiles.configPath')} <code className="font-mono">{TARGET_CONFIG_PATHS[targetType]}</code>
        </span>
      </div>

      {(targetType === 'hermes' || targetType === 'openclaw' || targetType === 'codex') && (
        <DefaultModelSection targetType={targetType} />
      )}

      {showNewForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{t('targetProfiles.newProfile')} {TARGET_LABELS[targetType]}</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileEditor
              targetType={TARGET_LABELS[targetType]}
              onSubmit={handleNewProfile}
              onCancel={() => setShowNewForm(false)}
              submitLabel={t('profileEditor.create')}
            />
          </CardContent>
        </Card>
      )}

      {profiles.length === 0 && !showNewForm && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plus className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('targetProfiles.noProfiles', { target: TARGET_LABELS[targetType] })}</p>
            <p className="text-xs text-muted-foreground">{t('targetProfiles.noProfilesDesc')}</p>
            <Button size="sm" className="mt-3" onClick={() => setShowNewForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              {t('targetProfiles.createFirstProfile')}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className={profile.isActive ? 'ring-1 ring-primary/50' : undefined}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {healthIcons[profile.healthStatus]}
                  <CardTitle className="text-base">{profile.name}</CardTitle>
                  {profile.isActive && <Badge variant="default">{t('targetProfiles.active')}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {applyingId === profile.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => handleApply(profile)}>
                      <Play className="mr-1 h-3 w-3" />
                      {t('targetProfiles.apply')}
                    </Button>
                  )}
                  {!profile.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleSwitch(profile.id)}>
                      <ArrowRightLeft className="mr-1 h-3 w-3" />
                      {t('targetProfiles.setActive')}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(profile.id)}>
                    {expandedId === profile.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription>
                {profile.providerType} · {profile.baseUrl}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{t('dashboard.defaultModel')}: {profile.defaultModel}</Badge>
                <Badge variant="outline">{t('dashboard.fastModel')}: {profile.fastModel}</Badge>
                <Badge variant="outline">{t('dashboard.reasoningModel')}: {profile.reasoningModel}</Badge>
              </div>

              {applyResult && applyResult.profileId === profile.id && (
                <div className={`mt-3 flex items-center gap-2 rounded-md border p-2 ${
                  applyResult.success ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'
                }`}>
                  {applyResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-xs ${applyResult.success ? 'text-emerald-200' : 'text-red-200'}`}>
                    {applyResult.message}
                  </span>
                </div>
              )}

              {expandedId === profile.id && (
                <div className="mt-4 space-y-3">
                  <Separator />
                  {editingId === profile.id ? (
                    <ProfileEditor
                      initial={profile}
                      targetType={TARGET_LABELS[targetType]}
                      onSubmit={(data) => handleEditProfile(profile.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel={t('profileEditor.save')}
                    />
                  ) : (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <span className="text-xs text-muted-foreground">{t('targetProfiles.api_key')}</span>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                              {revealedKeys.has(profile.id) ? profile.apiKey : maskApiKey(profile.apiKey)}
                            </code>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleKeyReveal(profile.id)}>
                              {revealedKeys.has(profile.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">{t('targetProfiles.lastApplied')}</span>
                          <p className="mt-1 text-sm">
                            {profile.lastApplied ? new Date(profile.lastApplied).toLocaleString() : t('targetProfiles.never')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">{t('targetProfiles.health')}</span>
                        <div className="mt-1 flex items-center gap-2">
                          {healthIcons[profile.healthStatus]}
                          <span className="text-sm">{t(`health.${profile.healthStatus}`)}</span>
                        </div>
                      </div>
                      {confirmDeleteId === profile.id ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                          <p className="text-sm text-destructive">
                            {t('targetProfiles.deleteConfirm', { name: profile.name })}
                          </p>
                          <p className="text-xs text-muted-foreground">{t('targetProfiles.deleteDesc')}</p>
                          <div className="mt-2 flex gap-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
                              {t('targetProfiles.confirmDelete')}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                              {t('targetProfiles.cancel')}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(profile.id)}>
                            <Pencil className="mr-1 h-3 w-3" />
                            {t('targetProfiles.edit')}
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(profile.id)}>
                            <Trash2 className="mr-1 h-3 w-3" />
                            {t('targetProfiles.delete')}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
