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
import { mockProfiles } from "@/data/mock";
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
} from "lucide-react";
import type { HealthStatus } from "@/types";

const healthIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  offline: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

export function Profiles() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleKeyReveal = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
        <p className="text-muted-foreground">
          Manage your AI provider configuration profiles
        </p>
      </div>

      <div className="space-y-4">
        {mockProfiles.map((profile) => (
          <Card
            key={profile.id}
            className={
              profile.isActive ? "ring-1 ring-primary/50" : undefined
            }
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {healthIcons[profile.healthStatus]}
                  <CardTitle className="text-base">{profile.name}</CardTitle>
                  {profile.isActive && (
                    <Badge variant="default">Active</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!profile.isActive && (
                    <Button variant="outline" size="sm" disabled>
                      <ArrowRightLeft className="mr-1 h-3 w-3" />
                      Switch
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpand(profile.id)}
                  >
                    {expandedId === profile.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <CardDescription>
                {profile.providerType} · {profile.baseUrl}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">
                  Default: {profile.defaultModel}
                </Badge>
                <Badge variant="outline">Fast: {profile.fastModel}</Badge>
                <Badge variant="outline">
                  Reasoning: {profile.reasoningModel}
                </Badge>
              </div>

              {expandedId === profile.id && (
                <div className="mt-4 space-y-3">
                  <Separator />
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        API Key
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                          {revealedKeys.has(profile.id)
                            ? profile.apiKey
                            : maskApiKey(profile.apiKey)}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toggleKeyReveal(profile.id)}
                        >
                          {revealedKeys.has(profile.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Last Applied
                      </span>
                      <p className="mt-1 text-sm">
                        {profile.lastApplied
                          ? new Date(profile.lastApplied).toLocaleString()
                          : "Never"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-muted-foreground">
                      Enabled Targets
                    </span>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.enabledTargets.map((target) => (
                        <Badge key={target} variant="secondary">
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" disabled>
                      Edit Profile
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      Duplicate
                    </Button>
                    <Button variant="destructive" size="sm" disabled>
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
