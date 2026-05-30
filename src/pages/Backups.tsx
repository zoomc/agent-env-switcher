import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { redactSensitive } from '@/lib/mask';
import { useApp } from '@/store/AppContext';
import type { BackupRecord, DryRunChange } from '@/types';
import {
  Archive,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardDrive,
  ShieldAlert,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function DiffView({ diff }: { diff: DryRunChange }) {
  const { t } = useTranslation();
  const beforeLines = redactSensitive(diff.before).split('\n');
  const afterLines = redactSensitive(diff.after).split('\n');
  const maxLines = Math.max(beforeLines.length, afterLines.length);

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {diff.action === 'create' ? t('backups.fileWillBeCreated') : t('backups.fileWillBeModified')}: {diff.file}
      </p>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <span className="text-xs font-medium text-red-400">{t('backups.current')}</span>
          <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-muted/50 p-2 text-xs">
            {beforeLines.map((line, i) => (
              <div key={i} className="min-h-[1.25em]">{line || ' '}</div>
            ))}
            {Array.from({ length: Math.max(0, maxLines - beforeLines.length) }).map((_, i) => (
              <div key={`empty-b-${i}`} className="min-h-[1.25em] text-muted-foreground">·</div>
            ))}
          </pre>
        </div>
        <div>
          <span className="text-xs font-medium text-emerald-400">{t('backups.afterRestore')}</span>
          <pre className="mt-1 max-h-48 overflow-auto rounded-md bg-muted/50 p-2 text-xs">
            {afterLines.map((line, i) => (
              <div key={i} className="min-h-[1.25em]">{line || ' '}</div>
            ))}
            {Array.from({ length: Math.max(0, maxLines - afterLines.length) }).map((_, i) => (
              <div key={`empty-a-${i}`} className="min-h-[1.25em] text-muted-foreground">·</div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

function BackupCard({ backup }: { backup: BackupRecord }) {
  const { deleteBackup, previewRestore, restoreBackup } = useApp();
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewDiff, setPreviewDiff] = useState<DryRunChange | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canRestore = showPreview && previewDiff !== null;

  const handlePreview = async () => {
    if (showPreview) { setShowPreview(false); setPreviewDiff(null); return; }
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const result = await previewRestore(backup);
      if (result.canRestore) { setPreviewDiff(result.diff); setShowPreview(true); }
      else { setPreviewError(result.error || 'Cannot restore this backup'); }
    } catch (err) { setPreviewError(err instanceof Error ? err.message : 'Preview failed'); }
    finally { setPreviewLoading(false); }
  };

  const handleRestore = async () => {
    setRestoreLoading(true);
    setRestoreResult(null);
    try {
      const result = await restoreBackup(backup);
      setRestoreResult(result.success
        ? { success: true, message: t('backups.restoredSuccess') }
        : { success: false, message: result.error || t('backups.restoreFailed') });
    } catch (err) {
      setRestoreResult({ success: false, message: err instanceof Error ? err.message : t('backups.restoreFailed') });
    } finally { setRestoreLoading(false); setRestoreConfirm(false); }
  };

  const handleDeleteBackup = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    deleteBackup(backup.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base">{backup.targetName}</CardTitle>
            {backup.restoreSupported ? (
              <Badge variant="default" className="text-xs">
                <RotateCcw className="mr-1 h-3 w-3" />
                {t('backups.restorableBadge')}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">{t('backups.backupOnly')}</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{new Date(backup.createdAt).toLocaleString()}</span>
        </div>
        <CardDescription>
          {t('profiles.title')}: {backup.profileName} · {formatFileSize(backup.backupFileSize)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{backup.targetType}</Badge>
            <Badge variant="secondary">{backup.originalConfigPath}</Badge>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <ChevronUp className="mr-1 h-3 w-3" /> : <ChevronDown className="mr-1 h-3 w-3" />}
              {showDetails ? t('backups.hideDetails') : t('backups.showDetails')}
            </Button>
            <div className="flex items-center gap-2">
              {backup.restoreSupported && (
                <Button variant="outline" size="sm" onClick={handlePreview} disabled={previewLoading}>
                  <Eye className="mr-1 h-3 w-3" />
                  {previewLoading ? t('backups.loading') : showPreview ? t('backups.hidePreview') : t('backups.previewRestore')}
                </Button>
              )}
              {backup.restoreSupported && !restoreConfirm && (
                <Button variant="outline" size="sm" disabled={!canRestore} onClick={() => setRestoreConfirm(true)}>
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {t('backups.restore')}
                </Button>
              )}
              {!canRestore && backup.restoreSupported && (
                <span className="text-xs text-muted-foreground">{t('backups.previewRequired')}</span>
              )}
              {!backup.restoreSupported && (
                <Button variant="outline" size="sm" disabled>
                  <RotateCcw className="mr-1 h-3 w-3" />
                  {t('backups.restore')}
                </Button>
              )}
              {confirmDelete ? (
                <div className="flex items-center gap-1">
                  <Button variant="destructive" size="sm" onClick={handleDeleteBackup}>{t('backups.confirm')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>{t('backups.cancel')}</Button>
                </div>
              ) : (
                <Button variant="destructive" size="sm" onClick={handleDeleteBackup}>
                  <Trash2 className="mr-1 h-3 w-3" />
                  {t('backups.delete')}
                </Button>
              )}
            </div>
          </div>

          {showDetails && (
            <div className="space-y-2 rounded-md bg-muted/30 p-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div>
                  <span className="text-xs text-muted-foreground">{t('backups.backupId')}</span>
                  <p className="text-xs font-mono">{backup.id}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">{t('backups.fileSize')}</span>
                  <p className="text-xs">{formatFileSize(backup.backupFileSize)}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">{t('backups.configPath')}</span>
                  <p className="text-xs font-mono">{backup.originalConfigPath}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">{t('backups.backupPath')}</span>
                  <p className="text-xs font-mono truncate" title={backup.backupFilePath}>
                    {backup.backupFilePath.split('/').slice(-2).join('/')}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground">{t('backups.checksum')}</span>
                <p className="text-xs font-mono break-all">{backup.checksum}</p>
              </div>
            </div>
          )}

          {previewError && (
            <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-xs text-amber-200">{previewError}</span>
            </div>
          )}

          {showPreview && previewDiff && (
            <div className="space-y-2 rounded-md border border-blue-500/30 bg-blue-500/5 p-3">
              <p className="text-xs font-medium text-blue-300">{t('backups.restorePreview')}</p>
              <DiffView diff={previewDiff} />
            </div>
          )}

          {restoreConfirm && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-sm text-amber-200">{t('backups.restoreConfirmMsg')}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('backups.restoreConfirmDesc', { target: backup.targetName, date: new Date(backup.createdAt).toLocaleString() })}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={handleRestore} disabled={restoreLoading}>
                  {restoreLoading ? t('backups.restoring') : t('backups.confirmRestore')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRestoreConfirm(false)}>{t('backups.cancel')}</Button>
              </div>
            </div>
          )}

          {restoreResult && (
            <div className={`flex items-center gap-2 rounded-md border p-2 ${
              restoreResult.success ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-destructive/30 bg-destructive/5'
            }`}>
              {restoreResult.success ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <XCircle className="h-4 w-4 text-destructive" />}
              <span className={`text-xs ${restoreResult.success ? 'text-emerald-200' : 'text-destructive'}`}>{restoreResult.message}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Backups() {
  const { backups } = useApp();
  const { t } = useTranslation();

  const totalSize = backups.reduce((sum, b) => sum + b.backupFileSize, 0);
  const restorableCount = backups.filter((b) => b.restoreSupported).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('backups.title')}</h1>
        <p className="text-muted-foreground">{t('backups.description')}</p>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
        <ShieldAlert className="h-4 w-4 text-amber-500" />
        <span className="text-xs text-amber-200">{t('backups.securityWarning')}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('backups.totalBackups')}</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{backups.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('backups.restorable')}</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{restorableCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('backups.totalSize')}</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatFileSize(totalSize)}</div></CardContent>
        </Card>
      </div>

      {backups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Archive className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t('backups.noBackups')}</p>
            <p className="text-xs text-muted-foreground">{t('backups.noBackupsDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {backups.map((backup) => <BackupCard key={backup.id} backup={backup} />)}
        </div>
      )}
    </div>
  );
}
