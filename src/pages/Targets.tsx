import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTargets, mockProfiles } from "@/data/mock";
import {
  CheckCircle2,
  XCircle,
  FolderOpen,
  ExternalLink,
} from "lucide-react";

export function Targets() {
  const getProfileCountForTarget = (targetType: string) =>
    mockProfiles.filter((p) => p.enabledTargets.includes(targetType as never))
      .length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Targets</h1>
        <p className="text-muted-foreground">
          AI coding tools and services you can configure
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockTargets.map((target) => (
          <Card
            key={target.id}
            className={
              !target.isAvailable ? "opacity-60" : undefined
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{target.name}</CardTitle>
                {target.isAvailable ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
              <CardDescription>{target.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">
                    {target.configPath}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge
                    variant={target.isAvailable ? "default" : "destructive"}
                  >
                    {target.isAvailable ? "Available" : "Unavailable"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getProfileCountForTarget(target.type)} profile
                    {getProfileCountForTarget(target.type) !== 1 ? "s" : ""}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
