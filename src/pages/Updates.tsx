import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  RefreshCw,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Box,
  Bot,
  Bug,
} from 'lucide-react';

interface AgentInfo {
  id: string;
  name: string;
  icon: React.ReactNode;
  currentVersion: string | null;
  latestVersion: string | null;
  releaseDate: string | null;
  updateCommand: string;
  githubRepo?: string;
  npmPackage?: string;
}

const agents: Omit<AgentInfo, 'currentVersion' | 'latestVersion' | 'releaseDate'>[] = [
  {
    id: 'claude-code',
    name: 'Claude Code',
    icon: <Terminal className="h-4 w-4" />,
    updateCommand: 'npm update -g @anthropic-ai/claude-code',
    githubRepo: 'anthropics/claude-code',
    npmPackage: '@anthropic-ai/claude-code',
  },
  {
    id: 'codex',
    name: 'Codex',
    icon: <Box className="h-4 w-4" />,
    updateCommand: 'npm update -g @openai/codex',
    githubRepo: 'openai/codex',
    npmPackage: '@openai/codex',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    icon: <Bot className="h-4 w-4" />,
    updateCommand: 'npm update -g hermes-agent',
    npmPackage: 'hermes-agent',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    icon: <Bug className="h-4 w-4" />,
    updateCommand: 'npm update -g openclaw',
    npmPackage: 'openclaw',
  },
];

export function Updates() {
  const { t } = useTranslation();
  const [agentStates, setAgentStates] = useState<Record<string, {
    currentVersion: string | null;
    latestVersion: string | null;
    releaseDate: string | null;
    checking: boolean;
    updating: boolean;
    updateResult: 'success' | 'error' | null;
  }>>({});

  const getState = (id: string) => agentStates[id] || {
    currentVersion: null, latestVersion: null, releaseDate: null,
    checking: false, updating: false, updateResult: null,
  };

  const checkVersion = useCallback(async (agent: typeof agents[0]) => {
    setAgentStates((prev) => ({ ...prev, [agent.id]: { ...getState(agent.id), checking: true } }));

    let latestVersion = null;
    let releaseDate = null;

    if (agent.githubRepo) {
      try {
        const resp = await fetch(`https://api.github.com/repos/${agent.githubRepo}/releases/latest`);
        if (resp.ok) {
          const data = await resp.json();
          latestVersion = data.tag_name?.replace(/^v/, '') || null;
          releaseDate = data.published_at || null;
        }
      } catch {}
    }

    if (!latestVersion && agent.npmPackage) {
      try {
        const resp = await fetch(`https://registry.npmjs.org/${agent.npmPackage}/latest`);
        if (resp.ok) {
          const data = await resp.json();
          latestVersion = data.version || null;
        }
      } catch {}
    }

    setAgentStates((prev) => ({
      ...prev,
      [agent.id]: {
        ...getState(agent.id),
        latestVersion,
        releaseDate,
        checking: false,
      },
    }));
  }, []);

  const checkAll = useCallback(async () => {
    for (const agent of agents) {
      await checkVersion(agent);
    }
  }, [checkVersion]);

  const simulateUpdate = useCallback(async (agent: typeof agents[0]) => {
    setAgentStates((prev) => ({ ...prev, [agent.id]: { ...getState(agent.id), updating: true, updateResult: null } }));
    // Simulate update delay (real updates would run via Tauri shell)
    await new Promise((r) => setTimeout(r, 2000));
    setAgentStates((prev) => ({
      ...prev,
      [agent.id]: {
        ...getState(agent.id),
        currentVersion: getState(agent.id).latestVersion || getState(agent.id).currentVersion,
        updating: false,
        updateResult: 'success',
      },
    }));
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agent.id]: { ...prev[agent.id], updateResult: null } }));
    }, 3000);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('updates.title')}</h1>
          <p className="text-muted-foreground">{t('updates.description')}</p>
        </div>
        <Button size="sm" onClick={checkAll} disabled={agents.some((a) => getState(a.id).checking)}>
          {agents.some((a) => getState(a.id).checking) ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-1 h-4 w-4" />
          )}
          {t('updates.checkForUpdates')}
        </Button>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => {
          const state = getState(agent.id);
          const hasUpdate = state.latestVersion && state.currentVersion && state.latestVersion !== state.currentVersion;

          return (
            <Card key={agent.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {agent.icon}
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    {hasUpdate && <Badge variant="secondary">{t('updates.updateAvailable')}</Badge>}
                    {state.currentVersion && state.latestVersion && !hasUpdate && state.currentVersion === state.latestVersion && (
                      <Badge variant="default" className="bg-emerald-600">{t('updates.upToDate')}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline" size="sm"
                      onClick={() => checkVersion(agent)}
                      disabled={state.checking}
                    >
                      {state.checking ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
                      {state.checking ? t('updates.checking') : t('updates.checkForUpdates')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => simulateUpdate(agent)}
                      disabled={state.updating || !hasUpdate}
                    >
                      {state.updating ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Download className="mr-1 h-3 w-3" />}
                      {state.updating ? t('updates.updating') : t('updates.update')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground">{t('updates.currentVersion')}</span>
                    <p className="mt-1 text-sm font-mono">{state.currentVersion || t('updates.unknown')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t('updates.latestVersion')}</span>
                    <p className="mt-1 text-sm font-mono">{state.latestVersion || t('updates.neverChecked')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">{t('updates.releaseDate')}</span>
                    <p className="mt-1 text-sm">
                      {state.releaseDate ? new Date(state.releaseDate).toLocaleDateString() : t('updates.neverChecked')}
                    </p>
                  </div>
                </div>
                <Separator className="my-3" />
                <div>
                  <span className="text-xs text-muted-foreground">Update command:</span>
                  <code className="ml-2 text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                    {agent.updateCommand}
                  </code>
                </div>
                {state.updateResult === 'success' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
                    <CheckCircle2 className="h-3 w-3" />{t('updates.updateSuccess')}
                  </div>
                )}
                {state.updateResult === 'error' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-500">
                    <AlertTriangle className="h-3 w-3" />{t('updates.updateFailed')}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
