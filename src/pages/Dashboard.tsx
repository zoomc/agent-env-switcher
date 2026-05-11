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
import { mockProfiles, mockTargets, mockBackups } from "@/data/mock";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Shield,
  Archive,
  UserCircle,
} from "lucide-react";
import type { HealthStatus } from "@/types";

const healthIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  degraded: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  offline: <XCircle className="h-4 w-4 text-red-500" />,
  unknown: <HelpCircle className="h-4 w-4 text-muted-foreground" />,
};

const healthLabels: Record<HealthStatus, string> = {
  healthy: "Healthy",
  degraded: "Degraded",
  offline: "Offline",
  unknown: "Unknown",
};

export function Dashboard() {
  const activeProfile = mockProfiles.find((p) => p.isActive);
  const availableTargets = mockTargets.filter((t) => t.isAvailable).length;
  const totalBackups = mockBackups.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your AI profile environment
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Profile
            </CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {activeProfile?.name ?? "None"}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeProfile?.providerType ?? "No profile active"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Targets
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {availableTargets}/{mockTargets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Targets ready for configuration
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backups</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{totalBackups}</div>
            <p className="text-xs text-muted-foreground">
              Configuration snapshots stored
            </p>
          </CardContent>
        </Card>
      </div>

      {activeProfile && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  Current: {activeProfile.name}
                </CardTitle>
                <CardDescription>
                  Active profile configuration overview
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {healthIcons[activeProfile.healthStatus]}
                <Badge
                  variant={
                    activeProfile.healthStatus === "healthy"
                      ? "default"
                      : activeProfile.healthStatus === "degraded"
                        ? "secondary"
                        : "destructive"
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
                  <span className="text-sm text-muted-foreground">
                    Provider
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.providerType}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Base URL
                  </span>
                  <span className="text-sm font-medium font-mono">
                    {activeProfile.baseUrl}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    API Key
                  </span>
                  <span className="text-sm font-medium font-mono">
                    {maskApiKey(activeProfile.apiKey)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Default Model
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.defaultModel}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Fast Model
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.fastModel}
                  </span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Reasoning Model
                  </span>
                  <span className="text-sm font-medium">
                    {activeProfile.reasoningModel}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                Enabled Targets:
              </span>
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
                Last applied:{" "}
                {new Date(activeProfile.lastApplied).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Health</CardTitle>
          <CardDescription>Status of all configured profiles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockProfiles.map((profile) => (
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
                  <Button variant="ghost" size="sm" disabled>
                    Switch
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
        <Activity className="h-4 w-4 text-amber-500" />
        <span className="text-xs text-amber-200">
          Running in Mock Mode — no real configuration changes will be made
        </span>
      </div>
    </div>
  );
}
