import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { maskApiKey } from "@/lib/mask";
import { useApp } from "@/store/AppContext";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  ArrowRightLeft,
  Plus,
  Pencil,
  Copy,
  Trash2,
  X,
} from "lucide-react";
import type { HealthStatus, Profile, ProviderType, TargetType } from "@/types";

const healthIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  offline: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

const providerTypes: ProviderType[] = [
  "openai-compatible", "deepseek", "kimi", "openai", "gemini-compatible", "local-gateway", "openrouter",
];

const allTargetTypes: TargetType[] = [
  "claude-code", "hermes", "openclaw", "openai-compatible-api", "deepseek", "kimi", "openai", "gemini-compatible", "local-gateway",
];

interface ProfileFormData {
  name: string;
  providerType: ProviderType;
  baseUrl: string;
  defaultModel: string;
  fastModel: string;
  reasoningModel: string;
  apiKey: string;
  enabledTargets: TargetType[];
}

const emptyForm: ProfileFormData = {
  name: "",
  providerType: "openai-compatible",
  baseUrl: "https://api.example.com/v1",
  defaultModel: "gpt-4o",
  fastModel: "gpt-4o-mini",
  reasoningModel: "o1",
  apiKey: "MOCK-sk-new-xxxx",
  enabledTargets: ["claude-code"],
};

function ProfileForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: ProfileFormData;
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initial);

  const toggleTarget = (t: TargetType) => {
    setForm((f) => ({
      ...f,
      enabledTargets: f.enabledTargets.includes(t)
        ? f.enabledTargets.filter((x) => x !== t)
        : [...f.enabledTargets, t],
    }));
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">Name</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Provider</label>
          <select
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
            value={form.providerType}
            onChange={(e) => setForm((f) => ({ ...f, providerType: e.target.value as ProviderType }))}
          >
            {providerTypes.map((p) => (
              <option key={p} value={p}>{p}</option>
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
          <label className="text-xs text-muted-foreground">API Key (mock)</label>
          <input
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm font-mono"
            value={form.apiKey}
            onChange={(e) => setForm((f) => ({ ...f, apiKey: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Enabled Targets</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {allTargetTypes.map((t) => (
            <Badge
              key={t}
              variant={form.enabledTargets.includes(t) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTarget(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex gap-2 pt-2">
        <Button size="sm" onClick={() => onSubmit(form)}>{submitLabel}</Button>
        <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

export function Profiles() {
  const { profiles, switchProfile, addProfile, updateProfile, deleteProfile, duplicateProfile } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingId(null);
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleNewProfile = (data: ProfileFormData) => {
    addProfile(data);
    setShowNewForm(false);
  };

  const handleEditProfile = (id: string, data: ProfileFormData) => {
    updateProfile(id, data);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    setConfirmDeleteId(null);
    setExpandedId(null);
  };

  const profileToFormData = (p: Profile): ProfileFormData => ({
    name: p.name,
    providerType: p.providerType,
    baseUrl: p.baseUrl,
    defaultModel: p.defaultModel,
    fastModel: p.fastModel,
    reasoningModel: p.reasoningModel,
    apiKey: p.apiKey,
    enabledTargets: p.enabledTargets,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
          <p className="text-muted-foreground">
            Manage your AI provider configuration profiles
          </p>
        </div>
        <Button size="sm" onClick={() => setShowNewForm(true)}>
          <Plus className="mr-1 h-4 w-4" />
          New Profile
        </Button>
      </div>

      {showNewForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Profile</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowNewForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileForm
              initial={emptyForm}
              onSubmit={handleNewProfile}
              onCancel={() => setShowNewForm(false)}
              submitLabel="Create"
            />
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className={profile.isActive ? "ring-1 ring-primary/50" : undefined}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {healthIcons[profile.healthStatus]}
                  <CardTitle className="text-base">{profile.name}</CardTitle>
                  {profile.isActive && <Badge variant="default">Active</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  {!profile.isActive && (
                    <Button variant="outline" size="sm" onClick={() => switchProfile(profile.id)}>
                      <ArrowRightLeft className="mr-1 h-3 w-3" />
                      Switch
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(profile.id)}>
                    {expandedId === profile.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <CardDescription>
                {profile.providerType} · {profile.baseUrl}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Default: {profile.defaultModel}</Badge>
                <Badge variant="outline">Fast: {profile.fastModel}</Badge>
                <Badge variant="outline">Reasoning: {profile.reasoningModel}</Badge>
              </div>

              {expandedId === profile.id && (
                <div className="mt-4 space-y-3">
                  <Separator />

                  {editingId === profile.id ? (
                    <ProfileForm
                      initial={profileToFormData(profile)}
                      onSubmit={(data) => handleEditProfile(profile.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="Save"
                    />
                  ) : (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <span className="text-xs text-muted-foreground">API Key</span>
                          <div className="mt-1 flex items-center gap-2">
                            <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                              {revealedKeys.has(profile.id) ? profile.apiKey : maskApiKey(profile.apiKey)}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => toggleKeyReveal(profile.id)}
                            >
                              {revealedKeys.has(profile.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                            </Button>
                          </div>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Last Applied</span>
                          <p className="mt-1 text-sm">
                            {profile.lastApplied ? new Date(profile.lastApplied).toLocaleString() : "Never"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-muted-foreground">Enabled Targets</span>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {profile.enabledTargets.map((target) => (
                            <Badge key={target} variant="secondary">{target}</Badge>
                          ))}
                        </div>
                      </div>

                      {confirmDeleteId === profile.id ? (
                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                          <p className="text-sm text-destructive">Delete &quot;{profile.name}&quot;?</p>
                          <p className="text-xs text-muted-foreground">This action cannot be undone (mock mode).</p>
                          <div className="mt-2 flex gap-2">
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(profile.id)}>
                              Confirm Delete
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setConfirmDeleteId(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(profile.id)}>
                            <Pencil className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => duplicateProfile(profile.id)}>
                            <Copy className="mr-1 h-3 w-3" />
                            Duplicate
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => setConfirmDeleteId(profile.id)}>
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
