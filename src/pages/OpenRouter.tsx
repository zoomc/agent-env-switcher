import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KeyInput } from '@/components/KeyInput';
import { useApp } from '@/store/AppContext';
import { exampleFreeModels } from '@/data/mock';
import {
  Globe,
  RefreshCw,
  Loader2,
  Zap,
  Database,
} from 'lucide-react';
import type { TargetType, FreeModel } from '@/types';

export function OpenRouter() {
  const { targetProfiles, applyTargetProfileChanges } = useApp();
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [applyingModelId, setApplyingModelId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<string | null>(null);
  const [selectedAgents, setSelectedAgents] = useState<Set<TargetType>>(
    new Set(['hermes', 'claude-code', 'codex', 'openclaw'])
  );
  const [freeModels, setFreeModels] = useState<FreeModel[]>(exampleFreeModels);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const agentTypes: TargetType[] = ['hermes', 'claude-code', 'codex', 'openclaw'];

  const fetchModels = useCallback(async () => {
    setFetching(true);
    setFetchError(null);
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/models');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      const models: FreeModel[] = (data.data || [])
        .filter((m: Record<string, unknown>) => {
          const pricing = m.pricing as Record<string, string> | undefined;
          return pricing?.prompt === '0' && pricing?.completion === '0';
        })
        .map((m: Record<string, unknown>, i: number) => {
          const arch = m.architecture as Record<string, unknown> | undefined;
          const pricing = m.pricing as Record<string, string>;
          return {
            id: `live-${i}`,
            modelId: m.id as string,
            name: m.name as string,
            contextLength: (m.context_length as number) || 0,
            modality: (arch?.modality as string) || 'text',
            pricing,
          };
        });
      if (models.length > 0) setFreeModels(models);
      else setFreeModels(exampleFreeModels);
    } catch {
      setFetchError(t('openrouter.fetchError'));
      setFreeModels(exampleFreeModels);
    } finally {
      setFetching(false);
    }
  }, [t]);

  const toggleAgent = (agent: TargetType) => {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agent)) next.delete(agent);
      else next.add(agent);
      return next;
    });
  };

  const handleApplyToSelected = async (modelId: string) => {
    const model = freeModels.find((m) => m.id === modelId);
    if (!model) return;

    setApplyingModelId(modelId);
    setApplyResult(null);

    const results: string[] = [];

    for (const targetType of agentTypes) {
      if (!selectedAgents.has(targetType)) continue;
      const profiles = targetProfiles[targetType] || [];
      const active = profiles.find((p) => p.isActive);
      if (active) {
        const result = await applyTargetProfileChanges({ ...active, defaultModel: model.modelId });
        results.push(`${targetType}: ${result.success ? 'OK' : result.error || 'failed'}`);
      } else {
        results.push(`${targetType}: ${t('openrouter.noActiveProfile')}`);
      }
    }

    setApplyResult(results.join('\n'));
    setApplyingModelId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('openrouter.title')}</h1>
        <p className="text-muted-foreground">{t('openrouter.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('openrouter.apiKeyTitle')}</CardTitle>
          <CardDescription>{t('openrouter.apiKeyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <KeyInput value={apiKey} onChange={setApiKey} label={t('openrouter.apiKeyLabel')} />
          </div>
          {apiKey && (
            <p className="mt-2 text-xs text-muted-foreground">{t('openrouter.apiKeyStorageInfo')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('openrouter.selectAgents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {agentTypes.map((agent) => (
              <Badge
                key={agent}
                variant={selectedAgents.has(agent) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleAgent(agent)}
              >
                {agent}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {fetchError && (
        <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
          <span className="text-xs text-amber-200">{fetchError}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{t('openrouter.freeModels')}</CardTitle>
              <CardDescription>
                {t('openrouter.freeModelsDesc', { count: freeModels.length })}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchModels} disabled={fetching}>
              {fetching ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
              {t('openrouter.refresh')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {freeModels.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{model.modelId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    <Database className="mr-1 h-3 w-3" />
                    {(model.contextLength / 1024).toFixed(0)}K
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{model.modality}</Badge>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => handleApplyToSelected(model.id)}
                    disabled={applyingModelId === model.id || selectedAgents.size === 0}
                  >
                    {applyingModelId === model.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Globe className="mr-1 h-3 w-3" />
                    )}
                    {t('openrouter.apply')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {applyResult && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-xs font-medium text-emerald-300 mb-1">{t('openrouter.applyResult')}</p>
          <pre className="text-xs text-emerald-200 whitespace-pre-wrap">{applyResult}</pre>
        </div>
      )}
    </div>
  );
}
