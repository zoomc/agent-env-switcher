import { useState } from 'react';
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

export function OpenRouter() {
  const { targetProfiles, applyTargetProfileChanges } = useApp();
  const [apiKey, setApiKey] = useState('');
  const [applyingModelId, setApplyingModelId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<string | null>(null);

  const freeModels = exampleFreeModels;

  const handleApplyToAll = async (modelId: string) => {
    const model = freeModels.find((m) => m.id === modelId);
    if (!model) return;

    setApplyingModelId(modelId);
    setApplyResult(null);

    const targets = ['hermes', 'claude-code', 'codex', 'openclaw'] as const;
    const results: string[] = [];

    for (const targetType of targets) {
      const profiles = targetProfiles[targetType] || [];
      const active = profiles.find((p) => p.isActive);
      if (active) {
        const result = await applyTargetProfileChanges({
          ...active,
          defaultModel: model.modelId,
        });
        results.push(
          `${targetType}: ${result.success ? 'OK' : result.error || 'failed'}`
        );
      } else {
        results.push(`${targetType}: no active profile`);
      }
    }

    setApplyResult(results.join('\n'));
    setApplyingModelId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">OpenRouter</h1>
        <p className="text-muted-foreground">
          Manage OpenRouter API key and discover free models
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">API Key</CardTitle>
          <CardDescription>Your OpenRouter API key for accessing models</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <KeyInput value={apiKey} onChange={setApiKey} label="OpenRouter API Key" />
          </div>
          {apiKey && (
            <p className="mt-2 text-xs text-muted-foreground">
              Stored locally. Never sent to any server except OpenRouter API.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Free Models</CardTitle>
              <CardDescription>
                Models with zero cost on OpenRouter ({freeModels.length} available)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="mr-1 h-4 w-4" />
              Refresh
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
                    <p className="text-xs text-muted-foreground font-mono">
                      {model.modelId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    <Database className="mr-1 h-3 w-3" />
                    {(model.contextLength / 1024).toFixed(0)}K
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {model.modality}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyToAll(model.id)}
                    disabled={applyingModelId === model.id}
                  >
                    {applyingModelId === model.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Globe className="mr-1 h-3 w-3" />
                    )}
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {applyResult && (
        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p className="text-xs font-medium text-emerald-300 mb-1">Apply Result</p>
          <pre className="text-xs text-emerald-200 whitespace-pre-wrap">
            {applyResult}
          </pre>
        </div>
      )}
    </div>
  );
}
