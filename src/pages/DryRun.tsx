import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { redactSensitive } from '@/lib/mask';
import { useApp } from '@/store/AppContext';
import {
  Play,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react';

export function DryRun() {
  const {
    profiles,
    dryRunResults,
    generateDryRun,
    applyChanges,
    isApplying,
    applyError,
    applySuccess,
    applyWarnings,
    clearApplyState,
  } = useApp();
  const { t } = useTranslation();
  const [selectedProfileId, setSelectedProfileId] = useState(
    profiles.find((p) => p.isActive)?.id ?? profiles[0]?.id ?? ''
  );
  const [confirmApply, setConfirmApply] = useState(false);

  const handleGenerate = () => {
    clearApplyState();
    setConfirmApply(false);
    generateDryRun(selectedProfileId);
  };

  const handleApply = () => {
    if (!confirmApply) { setConfirmApply(true); return; }
    applyChanges(selectedProfileId);
    setConfirmApply(false);
  };

  const filteredResults = dryRunResults.filter((r) => r.profileId === selectedProfileId);
  const hasChanges = filteredResults.some((r) => r.changes.length > 0);
  const hasReadyTargets = filteredResults.some((r) => r.status === 'ready');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('dryRun.title')}</h1>
        <p className="text-muted-foreground">{t('dryRun.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dryRun.selectProfile')}</CardTitle>
          <CardDescription>{t('dryRun.selectProfileDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('dryRun.noProfilesAvailable')}</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {profiles.map((profile) => (
                  <Button
                    key={profile.id}
                    variant={selectedProfileId === profile.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedProfileId(profile.id)}
                  >
                    {profile.name}
                    {profile.isActive && (
                      <Badge variant="secondary" className="ml-2 text-xs">{t('targetProfiles.active')}</Badge>
                    )}
                  </Button>
                ))}
              </div>
              <div className="mt-4">
                <Button size="sm" onClick={handleGenerate}>
                  <Play className="mr-1 h-4 w-4" />
                  {t('dryRun.runDryRun')}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {applySuccess && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-emerald-200">{t('dryRun.changesApplied')}</span>
        </div>
      )}

      {applyWarnings.length > 0 && (
        <div className="space-y-2">
          {applyWarnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-200">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {applyError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-200">{applyError}</span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs text-amber-200">{t('dryRun.dryRunOnly')}</span>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{result.targetName}</CardTitle>
                </div>
                <Badge
                  variant={
                    result.status === 'ready' ? 'default'
                      : result.status === 'applied' ? 'default'
                        : result.status === 'failed' ? 'destructive'
                          : 'secondary'
                  }
                >
                  {t(`dryRun.${result.status}`)}
                </Badge>
              </div>
              <CardDescription>
                {t('dryRun.profile')}: {result.profileName} · {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.status === 'failed' && result.changes.length > 0 && (
                  <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
                    <XCircle className="mt-0.5 h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-200">
                      {result.changes[0].after || 'Failed to generate preview for this target'}
                    </span>
                  </div>
                )}
                {result.changes.length > 0 && result.status !== 'failed' && result.changes.map((change, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{change.file}</span>
                      <Badge variant="outline" className="text-xs">{change.action}</Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                        <p className="mb-1 text-xs font-medium text-red-400">{t('dryRun.before')}</p>
                        <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap">
                          {change.before ? redactSensitive(change.before) : t('dryRun.empty')}
                        </pre>
                      </div>
                      <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="mb-1 text-xs font-medium text-emerald-400">{t('dryRun.after')}</p>
                        <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                          {redactSensitive(change.after)}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t('dryRun.changesDetected', { count: result.changes.length })}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>{t('dryRun.exportScript')}</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredResults.length === 0 && profiles.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">{t('dryRun.noProfiles')}</p>
              <p className="text-xs text-muted-foreground">
                {t('dryRun.selectProfileDesc')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {filteredResults.length > 0 && (
        <div className="mt-6 space-y-3">
          {confirmApply && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-sm text-amber-200">{t('dryRun.confirmApply')}</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleApply} disabled={isApplying}>
                  {isApplying ? t('dryRun.applying') : t('dryRun.confirmApplyBtn')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setConfirmApply(false)}>{t('dryRun.cancel')}</Button>
              </div>
            </div>
          )}
          {!confirmApply && (
            <div className="flex justify-end">
              <Button onClick={() => setConfirmApply(true)} disabled={!hasChanges || isApplying || !hasReadyTargets}>
                {isApplying && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                {isApplying ? t('dryRun.applying') : t('dryRun.applyChanges')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
