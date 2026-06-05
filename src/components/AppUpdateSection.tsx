import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Download, RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

type UpdateStatus = 'idle' | 'checking' | 'updating' | 'success' | 'error';

export function AppUpdateSection() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<UpdateStatus>('idle');
  const [currentVersion] = useState('v0.1.0');
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckForUpdates = async () => {
    setStatus('checking');
    setErrorMessage(null);

    try {
      // Simulate checking for updates
      // In production, this would call GitHub API or Tauri updater
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For now, just show "up to date" since we don't have a real update endpoint
      setLatestVersion(currentVersion);
      setStatus('idle');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  };

  const handleUpdateApp = async () => {
    setStatus('updating');
    setErrorMessage(null);

    try {
      // Simulate update process
      // In production, this would run: git pull && npm install && npm run build && cargo tauri build
      await new Promise((resolve) => setTimeout(resolve, 3000));

      setStatus('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('appUpdate.title')}</CardTitle>
        <CardDescription>{t('appUpdate.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Version */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('appUpdate.currentVersion')}</p>
              <p className="text-xs text-muted-foreground">{t('appUpdate.currentVersion')}</p>
            </div>
            <span className="text-sm font-mono">{currentVersion}</span>
          </div>

          <Separator />

          {/* Latest Version */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{t('appUpdate.latestVersion')}</p>
              <p className="text-xs text-muted-foreground">{t('appUpdate.latestVersion')}</p>
            </div>
            <span className="text-sm font-mono">
              {latestVersion ?? t('appUpdate.unknown')}
            </span>
          </div>

          <Separator />

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-emerald-200">{t('appUpdate.updateSuccess')}</span>
            </div>
          )}

          {status === 'error' && errorMessage && (
            <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-200">{errorMessage}</span>
            </div>
          )}

          {/* Update Note */}
          <div className="rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
            <span className="text-xs text-blue-200">{t('appUpdate.updateNote')}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCheckForUpdates}
              disabled={status === 'checking' || status === 'updating'}
            >
              {status === 'checking' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {status === 'checking' ? t('appUpdate.checking') : t('appUpdate.checkForUpdates')}
            </Button>

            <Button
              size="sm"
              onClick={handleUpdateApp}
              disabled={status === 'checking' || status === 'updating'}
            >
              {status === 'updating' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {status === 'updating' ? t('appUpdate.updating') : t('appUpdate.updateApp')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
