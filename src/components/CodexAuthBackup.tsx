import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, RotateCcw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { targetAdapter } from '@/lib/targetAdapters';

interface AuthBackup {
  apiKey: string;
  baseUrl: string;
  configContent: string;
  timestamp: string;
}

const STORAGE_KEY = 'agent-env-switcher:codex-auth-backups';

function loadAuthBackups(): AuthBackup[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAuthBackups(backups: AuthBackup[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(backups));
}

export function CodexAuthBackup() {
  const { t } = useTranslation();
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [result, setResult] = useState<'backup-ok' | 'backup-err' | 'restore-ok' | 'restore-err' | null>(null);
  const [backups, setBackups] = useState<AuthBackup[]>(loadAuthBackups);

  const handleBackup = async () => {
    setBacking(true);
    setResult(null);
    try {
      const content = await targetAdapter.read('codex');
      const envKey = import.meta.env.VITE_OPENAI_API_KEY || '';
      const envUrl = import.meta.env.VITE_OPENAI_BASE_URL || '';
      const backup: AuthBackup = {
        apiKey: envKey,
        baseUrl: envUrl,
        configContent: content,
        timestamp: new Date().toISOString(),
      };
      const updated = [backup, ...backups];
      setBackups(updated);
      saveAuthBackups(updated);
      setResult('backup-ok');
      setTimeout(() => setResult(null), 3000);
    } catch {
      setResult('backup-err');
      setTimeout(() => setResult(null), 3000);
    } finally {
      setBacking(false);
    }
  };

  const handleRestore = async (backup: AuthBackup) => {
    setRestoring(true);
    setResult(null);
    try {
      await targetAdapter.write('codex', {
        providerType: 'openai',
        baseUrl: backup.baseUrl,
        apiKey: backup.apiKey,
        defaultModel: 'gpt-5.5',
        fastModel: 'gpt-4o-mini',
        reasoningModel: 'o3',
      } as never);
      setResult('restore-ok');
      setTimeout(() => setResult(null), 3000);
    } catch {
      setResult('restore-err');
      setTimeout(() => setResult(null), 3000);
    } finally {
      setRestoring(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('codexAuth.title')}</CardTitle>
        <CardDescription>{t('codexAuth.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button size="sm" onClick={handleBackup} disabled={backing}>
            {backing ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Shield className="mr-1 h-3 w-3" />}
            {t('codexAuth.backupAuth')}
          </Button>

          {result === 'backup-ok' && (
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />{t('codexAuth.backupSuccess')}
            </div>
          )}
          {result === 'backup-err' && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <XCircle className="h-3 w-3" />{t('codexAuth.backupFailed')}
            </div>
          )}
          {result === 'restore-ok' && (
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />{t('codexAuth.restoreSuccess')}
            </div>
          )}
          {result === 'restore-err' && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <XCircle className="h-3 w-3" />{t('codexAuth.restoreFailed')}
            </div>
          )}

          {backups.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t('codexAuth.noBackups')}</p>
          ) : (
            <div className="space-y-2">
              {backups.map((b, i) => (
                <div key={i} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">
                      {new Date(b.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {b.configContent.length} bytes
                    </p>
                  </div>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleRestore(b)}
                    disabled={restoring}
                  >
                    {restoring ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />}
                    {t('codexAuth.restoreAuth')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
