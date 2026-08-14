import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AssistantPanel } from "@/components/ai/assistant-panel";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Program configuration and the AI assistant preview."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AssistantPanel />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Program Settings</CardTitle>
            <CardDescription>
              Fixed for this MVP deployment.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Program Name</span>
              <span className="font-medium text-foreground">
                Global Sales Transformation
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Language</span>
              <span className="font-medium text-foreground">English</span>
            </div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Appearance</span>
              <span className="font-medium text-foreground">Light</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Markets Tracked</span>
              <span className="font-medium text-foreground">
                Germany, France, Czech Republic
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
