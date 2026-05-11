import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/store/AppContext';
import {
  Play,
  AlertTriangle,
  FileText,
  ArrowRight,
  CheckCircle,
  Loader2,
  XCircle,
} from 'lucide-react';

export function DryRun() {
  const {
    profiles,
    dryRunResults,
    generateDryRun,
    applyChanges,
    isApplying,
    applyError,
    applySuccess,
    applyWarnings,
    clearApplyState,
  } = useApp();
  const [selectedProfileId, setSelectedProfileId] = useState(
    profiles.find((p) => p.isActive)?.id ?? profiles[0]?.id ?? ''
  );

  const handleGenerate = () => {
    clearApplyState();
    generateDryRun(selectedProfileId);
  };

  const handleApply = () => {
    applyChanges(selectedProfileId);
  };

  const filteredResults = dryRunResults.filter((r) => r.profileId === selectedProfileId);
  const hasChanges = filteredResults.some((r) => r.changes.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dry Run</h1>
        <p className="text-muted-foreground">Preview configuration changes before applying them</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Profile</CardTitle>
          <CardDescription>Choose a profile to preview its configuration changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {profiles.map((profile) => (
              <Button
                key={profile.id}
                variant={selectedProfileId === profile.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedProfileId(profile.id)}
              >
                {profile.name}
                {profile.isActive && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <Button size="sm" onClick={handleGenerate}>
              <Play className="mr-1 h-4 w-4" />
              Run Dry Run
            </Button>
          </div>
        </CardContent>
      </Card>

      {applySuccess && (
        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-emerald-200">Changes applied successfully!</span>
        </div>
      )}

      {applyWarnings.length > 0 && (
        <div className="space-y-2">
          {applyWarnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
              <span className="text-sm text-amber-200">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {applyError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 p-3">
          <XCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-200">{applyError}</span>
        </div>
      )}

      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <span className="text-xs text-amber-200">
          Dry Run only previews changes. Apply Changes will write selected supported targets after
          backup.
        </span>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result) => (
          <Card key={result.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Play className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">{result.targetName}</CardTitle>
                </div>
                <Badge
                  variant={
                    result.status === 'ready'
                      ? 'default'
                      : result.status === 'applied'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {result.status}
                </Badge>
              </div>
              <CardDescription>
                Profile: {result.profileName} · {new Date(result.timestamp).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.changes.map((change, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm font-mono">{change.file}</span>
                      <Badge variant="outline" className="text-xs">
                        {change.action}
                      </Badge>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3">
                        <p className="mb-1 text-xs font-medium text-red-400">Before</p>
                        <pre className="text-xs font-mono text-red-300 whitespace-pre-wrap">
                          {change.before || '(empty)'}
                        </pre>
                      </div>
                      <div className="rounded-md bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="mb-1 text-xs font-medium text-emerald-400">After</p>
                        <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                          {change.after}
                        </pre>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {result.changes.length} change{result.changes.length !== 1 ? 's' : ''} detected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Export Script
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleApply}
                      disabled={!hasChanges || isApplying || result.status === 'applied'}
                    >
                      {isApplying && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
                      {isApplying ? 'Applying...' : 'Apply Changes'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Play className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No dry-run results yet</p>
              <p className="text-xs text-muted-foreground">
                Click "Run Dry Run" to preview configuration changes
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
