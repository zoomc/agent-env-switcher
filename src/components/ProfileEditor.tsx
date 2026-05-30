import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { KeyInput } from '@/components/KeyInput';
import type { ProviderType, TargetProfile } from '@/types';
import { VALID_PROVIDER_TYPES } from '@/types';

interface ProfileEditorProps {
  initial?: Partial<TargetProfile>;
  onSubmit: (data: Omit<TargetProfile, 'id' | 'targetType' | 'isActive' | 'lastApplied' | 'healthStatus'>) => void;
  onCancel: () => void;
  submitLabel: string;
  targetType: string;
}

const emptyForm = {
  name: '',
  providerType: 'openai-compatible' as ProviderType,
  baseUrl: 'https://api.example.com/v1',
  defaultModel: 'gpt-4o',
  fastModel: 'gpt-4o-mini',
  reasoningModel: 'o1',
  apiKey: '',
};

export function ProfileEditor({ initial, onSubmit, onCancel, submitLabel }: ProfileEditorProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: initial?.name ?? emptyForm.name,
    providerType: initial?.providerType ?? emptyForm.providerType,
    baseUrl: initial?.baseUrl ?? emptyForm.baseUrl,
    defaultModel: initial?.defaultModel ?? emptyForm.defaultModel,
    fastModel: initial?.fastModel ?? emptyForm.fastModel,
    reasoningModel: initial?.reasoningModel ?? emptyForm.reasoningModel,
    apiKey: initial?.apiKey ?? emptyForm.apiKey,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">{t('profileEditor.profileName')}</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t('profileEditor.provider')}</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.providerType}
            onChange={(e) => setForm((f) => ({ ...f, providerType: e.target.value as ProviderType }))}
          >
            {VALID_PROVIDER_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">{t('profileEditor.baseUrl')}</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono"
            value={form.baseUrl}
            onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t('profileEditor.defaultModel')}</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.defaultModel}
            onChange={(e) => setForm((f) => ({ ...f, defaultModel: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t('profileEditor.fastModel')}</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.fastModel}
            onChange={(e) => setForm((f) => ({ ...f, fastModel: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">{t('profileEditor.reasoningModel')}</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.reasoningModel}
            onChange={(e) => setForm((f) => ({ ...f, reasoningModel: e.target.value }))}
          />
        </div>
        <div>
          <KeyInput
            value={form.apiKey}
            onChange={(val) => setForm((f) => ({ ...f, apiKey: val }))}
            label={t('profileEditor.apiKey')}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>{submitLabel}</Button>
        <Button variant="outline" size="sm" onClick={onCancel}>{t('profileEditor.cancel')}</Button>
      </div>
    </div>
  );
}
