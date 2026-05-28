import { useState } from 'react';
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

export function ProfileEditor({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  targetType,
}: ProfileEditorProps) {
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
          <label className="text-xs text-muted-foreground">Profile Name</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder={`My ${targetType} profile`}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Provider</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.providerType}
            onChange={(e) =>
              setForm((f) => ({ ...f, providerType: e.target.value as ProviderType }))
            }
          >
            {VALID_PROVIDER_TYPES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="text-xs text-muted-foreground">Base URL</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono"
            value={form.baseUrl}
            onChange={(e) => setForm((f) => ({ ...f, baseUrl: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Default Model</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.defaultModel}
            onChange={(e) => setForm((f) => ({ ...f, defaultModel: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Fast Model</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.fastModel}
            onChange={(e) => setForm((f) => ({ ...f, fastModel: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Reasoning Model</label>
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
          />
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={handleSubmit} disabled={!form.name.trim()}>
          {submitLabel}
        </Button>
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
