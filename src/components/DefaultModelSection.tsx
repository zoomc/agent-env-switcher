import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { readDefaultModel, writeDefaultModel } from '@/lib/targetAdapters';
import type { TargetType } from '@/types';
import { TARGET_LABELS } from '@/types';

const knownModels: Record<string, string[]> = {
  hermes: [
    'deepseek-chat', 'deepseek-coder', 'deepseek-reasoner',
    'gpt-4o', 'gpt-4o-mini', 'o1', 'o3',
    'claude-sonnet-4', 'claude-opus-4',
    'moonshot-v1-8k', 'moonshot-v1-32k',
  ],
  openclaw: [
    'deepseek-chat', 'deepseek-coder', 'deepseek-reasoner',
    'gpt-4o', 'gpt-4o-mini', 'o1', 'o3',
    'claude-sonnet-4', 'claude-opus-4',
    'llama-3.3-70b-instruct', 'qwen-2.5-72b-instruct',
  ],
  codex: [
    'gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.3-codex',
    'o3', 'o4-mini',
    'gpt-4o', 'gpt-4o-mini',
  ],
};

interface DefaultModelSectionProps {
  targetType: TargetType;
}

export function DefaultModelSection({ targetType }: DefaultModelSectionProps) {
  const { t } = useTranslation();
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [setting, setSetting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);

  const models = knownModels[targetType] || [];

  useEffect(() => {
    let cancelled = false;
    readDefaultModel(targetType).then((model) => {
      if (!cancelled) {
        setCurrentModel(model);
        setSelectedModel(model || '');
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [targetType]);

  const handleSetDefault = async () => {
    if (!selectedModel) return;
    setSetting(true);
    setResult(null);
    try {
      await writeDefaultModel(targetType, selectedModel);
      setCurrentModel(selectedModel);
      setResult('success');
      setTimeout(() => setResult(null), 3000);
    } catch {
      setResult('error');
      setTimeout(() => setResult(null), 3000);
    } finally {
      setSetting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('defaultModel.title')}</CardTitle>
        <CardDescription>{t('defaultModel.description')} — {TARGET_LABELS[targetType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{t('defaultModel.currentDefault')}</span>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <span className="font-mono font-medium">{currentModel || t('defaultModel.none')}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <select
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={loading}
            >
              <option value="">{t('defaultModel.selectModel')}</option>
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleSetDefault}
              disabled={loading || setting || !selectedModel || selectedModel === currentModel}
            >
              {setting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
              {setting ? t('defaultModel.setting') : t('defaultModel.setDefault')}
            </Button>
          </div>
          {result === 'success' && (
            <div className="flex items-center gap-2 text-xs text-emerald-500">
              <CheckCircle2 className="h-3 w-3" />
              {t('defaultModel.success')}
            </div>
          )}
          {result === 'error' && (
            <div className="flex items-center gap-2 text-xs text-red-500">
              <XCircle className="h-3 w-3" />
              {t('defaultModel.failed')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
