import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/store/AppContext';
import { ChevronDown, ChevronUp, Save, Info, AlertTriangle } from 'lucide-react';

export function Settings() {
  const { settings, updateSettings, profiles, loadError } = useApp();
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.description')}</p>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-amber-200">
            {loadError}. Default data has been loaded instead.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
        <Info className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-blue-200">{t('settings.appInfo')}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('settings.safety')}</CardTitle>
          <CardDescription>{t('settings.safetyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.confirmBeforeApply')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.confirmBeforeApplyDesc')}</p>
              </div>
              <Button
                variant={settings.confirmBeforeApply ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ confirmBeforeApply: !settings.confirmBeforeApply })}
              >
                {settings.confirmBeforeApply ? t('settings.enabled') : t('settings.disabled')}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.autoBackup')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.autoBackupDesc')}</p>
              </div>
              <Button
                variant={settings.autoBackup ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateSettings({ autoBackup: !settings.autoBackup })}
              >
                {settings.autoBackup ? t('settings.enabled') : t('settings.disabled')}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t('settings.backupRetention')}</p>
                <p className="text-xs text-muted-foreground">{t('settings.backupRetentionDesc')}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => updateSettings({ backupRetentionDays: Math.max(7, settings.backupRetentionDays - 7) })}
                >
                  −
                </Button>
                <span className="w-16 text-center text-sm font-medium">
                  {t('settings.days', { count: settings.backupRetentionDays })}
                </span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => updateSettings({ backupRetentionDays: Math.min(365, settings.backupRetentionDays + 7) })}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
            <div>
              <CardTitle className="text-lg">{t('settings.advanced')}</CardTitle>
              <CardDescription>{t('settings.advancedDesc')}</CardDescription>
            </div>
            {showAdvanced ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {showAdvanced && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('settings.advancedMode')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.advancedModeDesc')}</p>
                </div>
                <Button variant={settings.advancedMode ? 'default' : 'outline'} size="sm" onClick={() => updateSettings({ advancedMode: !settings.advancedMode })}>
                  {settings.advancedMode ? t('settings.enabled') : t('settings.disabled')}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{t('settings.defaultProfile')}</p>
                  <p className="text-xs text-muted-foreground">{t('settings.defaultProfileDesc')}</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {profiles.find((p) => p.id === settings.defaultProfileId)?.name ?? t('settings.none')}
                </span>
              </div>
              <Separator />
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">{t('settings.dangerZone')}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t('settings.dangerZoneDesc')}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="destructive" size="sm" disabled>{t('settings.resetAllProfiles')}</Button>
                  <Button variant="destructive" size="sm" disabled>{t('settings.deleteAllBackups')}</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-500">{t('settings.settingsSaved')}</span>}
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          {t('settings.saveSettings')}
        </Button>
      </div>
    </div>
  );
}
