import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/store/AppContext";
import { ChevronDown, ChevronUp, Save, Info } from "lucide-react";

export function Settings() {
  const { settings, updateSettings, profiles } = useApp();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Application preferences and behavior</p>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
        <Info className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-blue-200">
          This app only manages its own profile data. It does not modify Claude Code, Hermes, or OpenClaw configurations.
          Data is persisted via localStorage.
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <div className="flex gap-2">
              {(["dark", "light", "system"] as const).map((theme) => (
                <Button key={theme} variant={settings.theme === theme ? "default" : "outline"} size="sm" onClick={() => updateSettings({ theme })}>
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Safety</CardTitle>
          <CardDescription>Control how configuration changes are applied</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Confirm Before Apply</p>
                <p className="text-xs text-muted-foreground">Show confirmation dialog before applying changes</p>
              </div>
              <Button variant={settings.confirmBeforeApply ? "default" : "outline"} size="sm" onClick={() => updateSettings({ confirmBeforeApply: !settings.confirmBeforeApply })}>
                {settings.confirmBeforeApply ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto Backup</p>
                <p className="text-xs text-muted-foreground">Automatically create backup before applying changes</p>
              </div>
              <Button variant={settings.autoBackup ? "default" : "outline"} size="sm" onClick={() => updateSettings({ autoBackup: !settings.autoBackup })}>
                {settings.autoBackup ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Backup Retention</p>
                <p className="text-xs text-muted-foreground">How long to keep backup snapshots</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => updateSettings({ backupRetentionDays: Math.max(7, settings.backupRetentionDays - 7) })}>−</Button>
                <span className="w-16 text-center text-sm font-medium">{settings.backupRetentionDays} days</span>
                <Button variant="outline" size="sm" onClick={() => updateSettings({ backupRetentionDays: Math.min(365, settings.backupRetentionDays + 7) })}>+</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)}>
            <div>
              <CardTitle className="text-lg">Advanced</CardTitle>
              <CardDescription>Expert-level configuration options</CardDescription>
            </div>
            {showAdvanced ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>
        </CardHeader>
        {showAdvanced && (
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Advanced Mode</p>
                  <p className="text-xs text-muted-foreground">Show advanced configuration options in profile editor</p>
                </div>
                <Button variant={settings.advancedMode ? "default" : "outline"} size="sm" onClick={() => updateSettings({ advancedMode: !settings.advancedMode })}>
                  {settings.advancedMode ? "Enabled" : "Disabled"}
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Default Profile</p>
                  <p className="text-xs text-muted-foreground">Profile to activate on app startup</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {profiles.find((p) => p.id === settings.defaultProfileId)?.name ?? "None"}
                </span>
              </div>
              <Separator />
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-sm font-medium text-destructive">Danger Zone</p>
                <p className="mt-1 text-xs text-muted-foreground">These actions cannot be undone</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="destructive" size="sm" disabled>Reset All Profiles</Button>
                  <Button variant="destructive" size="sm" disabled>Delete All Backups</Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="text-xs text-emerald-500">Settings saved (localStorage)</span>}
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />Save Settings
        </Button>
      </div>
    </div>
  );
}
