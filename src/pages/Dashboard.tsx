import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { maskApiKey } from '@/lib/mask';
import { useApp } from '@/store/AppContext';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Shield,
  Bot,
  Terminal,
  Box,
  Bug,
} from 'lucide-react';
import type { HealthStatus, TargetType } from '@/types';
import { TARGET_LABELS } from '@/types';

const healthIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  broken: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

const healthLabels: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  broken: 'Broken',
  unknown: 'Unknown',
};

function getTargetIcon(targetType: TargetType): React.ReactNode {
  switch (targetType) {
    case 'hermes':
      return <Bot className="h-4 w-4" />;
    case 'claude-code':
      return <Terminal className="h-4 w-4" />;
    case 'codex':
      return <Box className="h-4 w-4" />;
    case 'openclaw':
      return <Bug className="h-4 w-4" />;
    case 'openai-compatible-api':
      return <Shield className="h-4 w-4" />;
  }
}

const targetRoutes: Partial<Record<TargetType, string>> = {
  hermes: '/hermes',
  'claude-code': '/claude-code',
  codex: '/codex',
  openclaw: '/openclaw',
};

export function Dashboard() {
  const { profiles, backups, switchProfile, activeProfile, loadError, targetProfiles } = useApp();
  const navigate = useNavigate();

  const targetTabs: TargetType[] = ['hermes', 'claude-code', 'codex', 'openclaw'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your AI profile environment</p>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="text-xs text-amber-200">
            {loadError}. Default data has been loaded instead.
          </span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        {targetTabs.map((targetType) => {
          const targetProfileList = targetProfiles[targetType] || [];
          const activeTargetProfile = targetProfileList.find((p) => p.isActive);
          return (
            <Card
              key={targetType}
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(targetRoutes[targetType] || '/')}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {TARGET_LABELS[targetType]}
                </CardTitle>
                {getTargetIcon(targetType)}
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {activeTargetProfile?.name ?? 'None'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {targetProfileList.length} profile{targetProfileList.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {activeProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Active Profile: {activeProfile.name}</CardTitle>
                <CardDescription>Active profile from unified profile list</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {healthIcons[activeProfile.healthStatus]}
                <Badge
                  variant={
                    activeProfile.healthStatus === 'healthy'
                      ? 'default'
                      : activeProfile.healthStatus === 'warning'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {healthLabels[activeProfile.healthStatus]}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provider</span>
                  <span className="text-sm font-medium">{activeProfile.providerType}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base URL</span>
                  <span className="text-sm font-medium font-mono">{activeProfile.baseUrl}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">API Key</span>
                  <span className="text-sm font-medium font-mono">
                    {maskApiKey(activeProfile.apiKey)}
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Default Model</span>
                  <span className="text-sm font-medium">{activeProfile.defaultModel}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Fast Model</span>
                  <span className="text-sm font-medium">{activeProfile.fastModel}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reasoning Model</span>
                  <span className="text-sm font-medium">{activeProfile.reasoningModel}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Enabled Targets:</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeProfile.enabledTargets.map((target) => (
                  <Badge key={target} variant="outline">
                    {target}
                  </Badge>
                ))}
              </div>
            </div>
            {activeProfile.lastApplied && (
              <p className="mt-4 text-xs text-muted-foreground">
                Last applied: {new Date(activeProfile.lastApplied).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backups</CardTitle>
            <CardDescription>Configuration snapshots stored</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{backups.length}</div>
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-sm"
              onClick={() => navigate('/backups')}
            >
              View Backups <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unified Profiles</CardTitle>
            <CardDescription>Profile management</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profiles.length}</div>
            <Button
              variant="link"
              className="mt-2 p-0 h-auto text-sm"
              onClick={() => navigate('/profiles')}
            >
              Manage Profiles <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Health</CardTitle>
          <CardDescription>Status of all unified profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  {healthIcons[profile.healthStatus]}
                  <span className="text-sm font-medium">{profile.name}</span>
                  {profile.isActive && (
                    <Badge variant="default" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {healthLabels[profile.healthStatus]}
                  </span>
                  {!profile.isActive && (
                    <Button variant="ghost" size="sm" onClick={() => switchProfile(profile.id)}>
                      Switch <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-md border border-blue-500/30 bg-blue-500/10 p-3">
        <Activity className="h-4 w-4 text-blue-400" />
        <span className="text-xs text-blue-200">
          Per-target profiles let you manage each AI tool independently. Unified profiles remain
          for backward compatibility.
        </span>
      </div>
    </div>
  );
}
