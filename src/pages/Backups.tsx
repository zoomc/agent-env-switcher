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
import { mockBackups } from "@/data/mock";
import { Archive, RotateCcw, Trash2, Download } from "lucide-react";

export function Backups() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Backups</h1>
        <p className="text-muted-foreground">
          Configuration snapshots for restore and recovery
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBackups.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockBackups.reduce((sum, b) => sum + b.fileCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.8 KB</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {mockBackups.map((backup) => (
          <Card key={backup.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {backup.profileName}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {new Date(backup.timestamp).toLocaleString()}
                </span>
              </div>
              <CardDescription>
                {backup.fileCount} files · {backup.size}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Affected Targets
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {backup.targetTypes.map((target) => (
                      <Badge key={target} variant="outline">
                        {target}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Backup ID: {backup.id}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                      <Download className="mr-1 h-3 w-3" />
                      Export
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Restore
                    </Button>
                    <Button variant="destructive" size="sm" disabled>
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
